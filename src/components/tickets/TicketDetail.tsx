// components/TicketDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Lock,
  LockOpen,
  Send,
  MessageSquare,
} from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  getTicketDetail,
  getTicketMessages,
  sendMessage,
  updateTicketStatus,
  TicketDetail as TicketDetailType,
  Message,
} from '../../api/ticketService';
import { RefreshControl } from 'react-native-gesture-handler';

type RootStackParamList = {
  TicketList: undefined;
  TicketDetail: { ticketId: number };
  CreateTicket: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'TicketDetail'>;
type RouteProp = import('@react-navigation/native').RouteProp<
  RootStackParamList,
  'TicketDetail'
>;

const TicketDetail: React.FC = () => {
  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ticketStatus, setTicketStatus] = useState<'open' | 'closed'>('open');

  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const { ticketId } = route.params;

  const loadTicketData = async (): Promise<void> => {
    try {
      const [ticketData, messagesData] = await Promise.all([
        getTicketDetail(ticketId),
        getTicketMessages(ticketId),
      ]);
      setTicket(ticketData);
      setTicketStatus(ticketData.status);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading ticket data:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    const text = messageText.trim();
    setMessageText('');

    try {
      const newMessage = await sendMessage(ticketId, text);
      setMessages(prev => [...prev, newMessage]);
      // Refresh ticket status
      const ticketData = await getTicketDetail(ticketId);
      setTicketStatus(ticketData.status);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (): Promise<void> => {
    try {
      const newStatus = ticketStatus === 'open' ? 'closed' : 'open';
      await updateTicketStatus(ticketId, newStatus);
      setTicketStatus(newStatus);
      Alert.alert(
        'Success',
        `Ticket ${newStatus === 'open' ? 'reopened' : 'closed'} successfully`,
      );
      // Refresh ticket data
      const ticketData = await getTicketDetail(ticketId);
      setTicket(ticketData);
    } catch (error) {
      console.error('Error toggling ticket status:', error);
      Alert.alert('Error', 'Failed to update ticket status');
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadTicketData();
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }): React.ReactElement => {
    const isOwn = !item.is_from_admin; // User messages are not from admin
    return (
      <View
        style={[
          styles.messageContainer,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.body}
          </Text>
          <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyMessages = (): React.ReactElement => (
    <View style={styles.emptyMessagesContainer}>
      <MessageSquare size={48} color="#C7C7CC" />
      <Text style={styles.emptyMessagesText}>No messages yet</Text>
      <Text style={styles.emptyMessagesSubtext}>Start the conversation</Text>
    </View>
  );

  const getStatusColor = (status: 'open' | 'closed'): string => {
    return status === 'open' ? '#34C759' : '#8E8E93';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {ticket?.subject || 'Ticket'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticketStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {ticketStatus === 'open' ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        {/* <TouchableOpacity
          onPress={handleToggleStatus}
          style={styles.headerAction}
        >
          {ticketStatus === 'open' ? (
            <Lock size={24} color="#FF3B30" />
          ) : (
            <LockOpen size={24} color="#34C759" />
          )}
        </TouchableOpacity> */}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={renderEmptyMessages}
        inverted={false}
      />

      {/* Input Area */}
      {ticketStatus === 'open' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                editable={!sending}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.closedBanner}>
          <Lock size={20} color="#FF3B30" />
          <Text style={styles.closedBannerText}>This ticket is closed</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerAction: {
    padding: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 15,
    color: '#000000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    gap: 8,
  },
  closedBannerText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TicketDetail;
