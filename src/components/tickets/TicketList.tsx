// components/TicketList.tsx
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { MessageSquare, X, Bell, ChevronRight } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { getTickets, Ticket, createTicket } from '../../api/ticketService';

type RootStackParamList = {
  TicketList: undefined;
  TicketDetail: { ticketId: number };
  CreateTicket: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'TicketList'>;

interface Coach {
  id: number;
  name: string;
  avatar: any;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  tickets: Ticket[];
}

export interface TicketListRef {
  refresh: () => Promise<void>;
}

const TicketList = forwardRef<TicketListRef>((_props, ref) => {
  const { t } = useTranslation();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newMessageModalVisible, setNewMessageModalVisible] =
    useState<boolean>(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState<number>(0);
  const navigation = useNavigation<NavigationProp>();

  const loadTickets = useCallback(async (): Promise<void> => {
    try {
      const tickets: Ticket[] = await getTickets();

      const unreadCount = tickets.reduce(
        (total, ticket) => total + (ticket.unread_by_user || 0),
        0,
      );

      const coachData: Coach = {
        id: 1,
        name: 'Mehrnaz',
        avatar: require('../../assets/Av2.jpeg'),
        lastMessage:
          tickets.length > 0 && tickets[0].last_message?.body
            ? tickets[0].last_message.body
            : t('No recent messages'),
        lastMessageTime:
          tickets.length > 0 ? tickets[0].updated_at : new Date().toISOString(),
        unreadCount: unreadCount,
        tickets: tickets,
      };

      // Check if there are new messages (unread count increased)
      if (unreadCount > 0) {
        setNewMessageModalVisible(true);
      }
      setPreviousUnreadCount(unreadCount);

      setCoach(coachData);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert(t('Error'), t('Failed to load tickets'));
    } finally {
      setLoading(false);
    }
  }, [t, previousUnreadCount]);

  // Exposes an imperative `refresh()` so a parent screen (e.g. HomeScreen's
  // pull-to-refresh) can force this list to refetch without owning its state.
  useImperativeHandle(ref, () => ({
    refresh: loadTickets,
  }));

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets]),
  );

  const handleCoachPress = async (): Promise<void> => {
    if (!coach) return;

    if (coach.tickets.length > 0) {
      setNewMessageModalVisible(false);
      navigation.navigate('TicketDetail', { ticketId: coach.tickets[0].id });
    } else {
      try {
        const newTicket = await createTicket('Chat with Coach', 'Hi');
        setNewMessageModalVisible(false);
        navigation.navigate('TicketDetail', { ticketId: newTicket.id });
      } catch (error) {
        console.error('Error creating ticket:', error);
        Alert.alert(t('Error'), t('Failed to create new conversation'));
      }
    }
  };

  const handleNewMessagePress = (): void => {
    setNewMessageModalVisible(false);
    if (coach && coach.tickets.length > 0) {
      navigation.navigate('TicketDetail', { ticketId: coach.tickets[0].id });
    }
  };

  const handleDismissNewMessage = (): void => {
    setNewMessageModalVisible(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return t('Just now');
    if (diff < 3600)
      return t('{{minutes}}m ago', { minutes: Math.floor(diff / 60) });
    if (diff < 86400)
      return t('{{hours}}h ago', { hours: Math.floor(diff / 3600) });
    return date.toLocaleDateString();
  };

  const renderCoachCard = () => {
    if (!coach) return null;

    return (
      <View style={styles.coachCard}>
        <View style={styles.coachCardContent}>
          <View style={styles.avatarContainer}>
            <Image source={coach.avatar} style={styles.coachAvatar} />
            {coach.unreadCount > 0 && (
              <View style={styles.avatarUnreadBadge}>
                <Text style={styles.avatarUnreadText}>
                  {coach.unreadCount > 9 ? '9+' : coach.unreadCount}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <View style={styles.coachInfo}>
              <View style={styles.coachHeader}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <Text style={styles.coachTime}>
                  {formatDate(coach.lastMessageTime)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={handleCoachPress}
                activeOpacity={0.8}
              >
                <Text style={styles.chatButtonText}>
                  {t('Chat with Coach')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MessageSquare size={48} color="#C7C7CC" />
      </View>
      <Text style={styles.emptyTitle}>{t('No Coaching Messages')}</Text>
      <Text style={styles.emptyText}>
        {t('Connect with your coach to start your wellness journey')}
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Text style={styles.createButtonText}>
          {t('Start New Conversation')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // New Message Notification Modal
  const renderNewMessageModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={newMessageModalVisible}
      onRequestClose={handleDismissNewMessage}
    >
      <View style={styles.newMessageOverlay}>
        <View style={styles.newMessageModal}>
          <TouchableOpacity
            style={styles.newMessageClose}
            onPress={handleDismissNewMessage}
          >
            <X size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.newMessageIconContainer}>
            <Bell size={32} color="#4F46E5" />
          </View>

          <Text style={styles.newMessageTitle}>
            {t('New Message Received!')}
          </Text>

          <Text style={styles.newMessageText}>
            {t('You have a new message from your coach.')}
          </Text>

          {coach && (
            <View style={styles.newMessagePreview}>
              <Image source={coach.avatar} style={styles.newMessageAvatar} />
              <View style={styles.newMessagePreviewContent}>
                <Text style={styles.newMessageCoachName}>{coach.name}</Text>
                <Text style={styles.newMessagePreviewText} numberOfLines={2}>
                  {coach.lastMessage}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.newMessageActions}>
            <TouchableOpacity
              style={[styles.newMessageButton, styles.newMessagePrimaryButton]}
              onPress={handleNewMessagePress}
            >
              <Text style={styles.newMessagePrimaryButtonText}>
                {t('View & Reply')}
              </Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.newMessageButton,
                styles.newMessageSecondaryButton,
              ]}
              onPress={handleDismissNewMessage}
            >
              <Text style={styles.newMessageSecondaryButtonText}>
                {t('Later')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {coach ? renderCoachCard() : renderEmptyState()}

      {/* New Message Notification Modal */}
      {renderNewMessageModal()}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('All Messages')}</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {coach && (
            <View style={styles.modalCoachProfile}>
              <Image source={coach.avatar} style={styles.modalCoachAvatar} />
              <Text style={styles.modalCoachName}>{coach.name}</Text>
            </View>
          )}

          <View style={styles.modalSectionHeader}>
            <Text style={styles.modalSectionTitle}>
              {t('All Conversations')}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default TicketList;

const styles = StyleSheet.create({
  container: {
    // was flex: 1 inside a SafeAreaView — that's for a full screen.
    // As an embedded card in HomeScreen's ScrollView it should just
    // hug its own content.
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  coachCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  coachCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  coachInfo: {
    flex: 1,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  coachTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalPlaceholder: {
    width: 24,
  },
  modalCoachProfile: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCoachAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  modalCoachName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F3FF',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarUnreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarUnreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatButton: {
    marginTop: 12,
    backgroundColor: '#123C3D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // New Message Modal Styles
  newMessageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  newMessageModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  newMessageClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  newMessageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  newMessageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  newMessageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  newMessagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newMessageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newMessagePreviewContent: {
    flex: 1,
  },
  newMessageCoachName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  newMessagePreviewText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  newMessageActions: {
    gap: 10,
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  newMessagePrimaryButton: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newMessagePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newMessageSecondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newMessageSecondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
