import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { loginuser, registeruser } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const { width } = Dimensions.get('window');

// ── Floating decorative circles ──────────────────────────────────────────────
function FloatingOrb({ style }: { style: object }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  return <Animated.View style={[style, { transform: [{ translateY }] }]} />;
}

// ── Text Input field ──────────────────────────────────────────────────────────
type InputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  error?: boolean;
  errorLabel?: string;
};

function FloatingInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  errorLabel,
}: InputProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = error
    ? '#ef4444'
    : focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e5e7eb', '#2d6a4f'],
      });

  return (
    <View style={inputStyles.wrapper}>
      <Text
        style={[
          inputStyles.label,
          focused && inputStyles.labelFocused,
          error && inputStyles.labelError,
        ]}
      >
        {label}
      </Text>
      <Animated.View style={[inputStyles.inputBox, { borderColor }]}>
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
      </Animated.View>
      {error && (
        <Text style={inputStyles.errorText}>
          {t('loginScreen.fieldRequired', { field: errorLabel ?? label })}
        </Text>
      )}
    </View>
  );
}

// ── Dropdown Select field ─────────────────────────────────────────────────────
type SelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  error?: boolean;
};

function SelectInput({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
}: SelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, error && inputStyles.labelError]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          inputStyles.inputBox,
          inputStyles.selectBox,
          open && { borderColor: '#2d6a4f' },
          error && { borderColor: '#ef4444' },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[inputStyles.input, !value && { color: '#9ca3af' }]}>
          {value || placeholder}
        </Text>
        <Text style={inputStyles.chevron}>▾</Text>
      </TouchableOpacity>
      {error && (
        <Text style={inputStyles.errorText}>
          {t('loginScreen.fieldRequired', { field: label })}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={selectStyles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={selectStyles.sheet}>
            <Text style={selectStyles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    selectStyles.option,
                    item === value && selectStyles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      selectStyles.optionText,
                      item === value && selectStyles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && <Text style={selectStyles.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Date Picker field ─────────────────────────────────────────────────────────
// Fixed for iOS: the spinner is now rendered inside its own bottom-sheet Modal
// (instead of inline in the ScrollView) with themeVariant="light" forced.
// This avoids the "white section, no visible numbers" bug that happens when
// the inline spinner picks up a dark/blank system appearance or gets clipped
// to zero height inside a scrollable parent.
type DatePickerProps = {
  label: string;
  value: Date | null;
  onSelect: (date: Date) => void;
  error?: boolean;
};

function DatePickerInput({ label, value, onSelect, error }: DatePickerProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  // temp value while the iOS modal is open, so Done/Cancel behave predictably
  const [tempDate, setTempDate] = useState<Date>(value || new Date(1990, 0, 1));

  const displayDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const openPicker = () => {
    setTempDate(value || new Date(1990, 0, 1));
    setShow(true);
  };

  const handleAndroidChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    if (event.type === 'set' && selectedDate) {
      onSelect(selectedDate);
    }
  };

  const handleDone = () => {
    onSelect(tempDate);
    setShow(false);
  };

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, error && inputStyles.labelError]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          inputStyles.inputBox,
          inputStyles.selectBox,
          error && { borderColor: '#ef4444' },
        ]}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        <Text style={[inputStyles.input, !value && { color: '#9ca3af' }]}>
          {value ? displayDate(value) : t('loginScreen.selectDateOfBirth')}
        </Text>
        <Text style={inputStyles.chevron}>📅</Text>
      </TouchableOpacity>
      {error && (
        <Text style={inputStyles.errorText}>
          {t('loginScreen.fieldRequired', { field: label })}
        </Text>
      )}

      {/* Android: native inline dialog, no modal wrapper needed */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS: spinner inside its own bottom-sheet Modal, light theme forced */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide">
          <TouchableOpacity
            style={datePickerStyles.overlay}
            activeOpacity={1}
            onPress={() => setShow(false)}
          >
            <TouchableOpacity activeOpacity={1} style={datePickerStyles.sheet}>
              <View style={datePickerStyles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={datePickerStyles.cancelText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <Text style={datePickerStyles.sheetTitle}>{label}</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={datePickerStyles.doneText}>
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={datePickerStyles.pickerWrap}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  themeVariant="light"
                  textColor="#1a1a1a"
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={datePickerStyles.picker}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const datePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cancelText: { fontSize: 15, color: '#9ca3af', fontWeight: '500' },
  doneText: { fontSize: 15, color: '#2d6a4f', fontWeight: '700' },
  pickerWrap: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: 216,
  },
});

const selectStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionActive: { backgroundColor: '#f0fdf4' },
  optionText: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  optionTextActive: { color: '#2d6a4f', fontWeight: '700' },
  check: { color: '#2d6a4f', fontWeight: '700', fontSize: 16 },
});

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  labelFocused: { color: '#2d6a4f' },
  labelError: { color: '#ef4444' },
  inputBox: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: { fontSize: 16, color: '#9ca3af' },
  input: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  errorText: { fontSize: 11, color: '#ef4444', marginTop: 4, marginLeft: 4 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { t } = useTranslation();
  const { setIsLoggedIn } = useAuth();
  const [islogin, setislogin] = useState<boolean>(true);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [workShift, setWorkShift] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [birthDate, setBirthDate] = useState<Date | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Options — built from translations so labels flip with language,
  // while the underlying value sent to the API stays the English key.
  const GENDER_OPTIONS = [
    t('loginScreen.genderOptions.male'),
    t('loginScreen.genderOptions.female'),
    t('loginScreen.genderOptions.other'),
  ];
  const DEPARTMENT_OPTIONS = [
    { label: t('departments.upperManagement'), value: 'Upper Management' },
    { label: t('departments.supportServices'), value: 'Support Services' },
    { label: t('departments.middleManagement'), value: 'Middle Management' },
    {
      label: t('departments.nursingAndCareStaff'),
      value: 'Nursing and Care Staff',
    },
    { label: t('departments.other'), value: 'Other' },
  ];
  const SHIFT_OPTIONS = [
    t('loginScreen.shiftOptions.day'),
    t('loginScreen.shiftOptions.morningAfternoon'),
    t('loginScreen.shiftOptions.night'),
    t('loginScreen.shiftOptions.other'),
  ];

  // Entrance animation
  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTabSwitch = (val: boolean) => {
    setislogin(val);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};

    if (islogin) {
      if (!email.trim()) newErrors.email = true;
      if (!password.trim()) newErrors.password = true;
    } else {
      if (!firstName.trim()) newErrors.firstName = true;
      if (!lastName.trim()) newErrors.lastName = true;
      if (!regEmail.trim()) newErrors.regEmail = true;
      if (!regPassword.trim()) newErrors.regPassword = true;
      if (!confirmPassword.trim()) newErrors.confirmPassword = true;
      if (regPassword && confirmPassword && regPassword !== confirmPassword) {
        newErrors.confirmPassword = true;
        newErrors.passwordMismatch = true;
      }
      if (!gender) newErrors.gender = true;
      if (!department) newErrors.department = true;
      if (!workShift) newErrors.workShift = true;
      if (!birthDate) newErrors.birthDate = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // blocks re-entry from rapid taps
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (islogin) {
        const res = await loginuser(email.trim(), password, 'Carewelluser');
        await AsyncStorage.setItem('access', res.token.access);
        await AsyncStorage.setItem('refresh', res.token.refresh);
        await AsyncStorage.setItem('user', JSON.stringify(res.user));

        setIsLoggedIn(true);
      } else {
        const res = await registeruser({
          username: regEmail.trim(),
          email: regEmail.trim(),
          password: regPassword, // confirmPassword is never sent, client-side check only
          role: 'Carewelluser',
          first_name: firstName,
          last_name: lastName,
          gender,
          department,
          work_shift: workShift,
          birth_date: birthDate!.toISOString().split('T')[0], // → "YYYY-MM-DD"
        });
        await AsyncStorage.setItem('access', res.token.access);
        await AsyncStorage.setItem('refresh', res.token.refresh);
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        JSON.stringify(error.response?.data || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.bg} pointerEvents="none">
        <FloatingOrb style={styles.orb1} />
        <FloatingOrb style={styles.orb2} />
        <FloatingOrb style={styles.orb3} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.actionsRow}>
            <LanguageSwitcher />
          </View>
          {/* Logo / brand */}
          <View style={styles.brandBlock}>
            <View style={styles.logoCircle} />
            <Text style={styles.appName}>CareWell</Text>
            <Text style={styles.appTagline}>{t('loginScreen.appTagline')}</Text>
          </View>
          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: cardAnim }], opacity: cardOpacity },
            ]}
          >
            {/* Tab toggle */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, islogin && styles.tabBtnActive]}
                onPress={() => handleTabSwitch(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabLabel, islogin && styles.tabLabelActive]}
                >
                  {t('loginScreen.signIn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, !islogin && styles.tabBtnActive]}
                onPress={() => handleTabSwitch(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabLabel, !islogin && styles.tabLabelActive]}
                >
                  {t('loginScreen.createAccount')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Greeting */}
            <Text style={styles.greeting}>
              {islogin
                ? t('loginScreen.welcomeBack')
                : t('loginScreen.joinCareWell')}
            </Text>
            <Text style={styles.greetingSub}>
              {islogin
                ? t('loginScreen.signInSubtitle')
                : t('loginScreen.signUpSubtitle')}
            </Text>

            {/* ── LOGIN FIELDS ── */}
            {islogin && (
              <>
                <FloatingInput
                  label={t('loginScreen.emailLabel')}
                  placeholder={t('loginScreen.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  error={errors.email}
                />
                <FloatingInput
                  label={t('loginScreen.passwordLabel')}
                  placeholder={t('loginScreen.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                />
                <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>
                    {t('loginScreen.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── REGISTER FIELDS ── */}
            {!islogin && (
              <>
                <FloatingInput
                  label={t('loginScreen.firstName')}
                  placeholder={t('loginScreen.firstName')}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
                <FloatingInput
                  label={t('loginScreen.lastName')}
                  placeholder={t('loginScreen.lastName')}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
                <FloatingInput
                  label={t('loginScreen.emailLabel')}
                  placeholder={t('loginScreen.emailPlaceholder')}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  error={errors.regEmail}
                />
                <FloatingInput
                  label={t('loginScreen.passwordLabel')}
                  placeholder={t('loginScreen.passwordPlaceholder')}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                  error={errors.regPassword}
                />
                <FloatingInput
                  label={t('loginScreen.confirmPasswordLabel')}
                  placeholder={t('loginScreen.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
                {errors.passwordMismatch && (
                  <Text style={styles.mismatchText}>
                    {t('loginScreen.passwordsDontMatch')}
                  </Text>
                )}
                <DatePickerInput
                  label={t('loginScreen.dateOfBirth')}
                  value={birthDate}
                  onSelect={setBirthDate}
                  error={errors.birthDate}
                />
                <SelectInput
                  label={t('loginScreen.gender')}
                  placeholder={t('loginScreen.selectGender')}
                  value={gender}
                  options={GENDER_OPTIONS}
                  onSelect={setGender}
                  error={errors.gender}
                />
                <SelectInput
                  label={t('loginScreen.department')}
                  placeholder={t('loginScreen.selectDepartment')}
                  value={
                    DEPARTMENT_OPTIONS.find(d => d.value === department)
                      ?.label ?? ''
                  }
                  options={DEPARTMENT_OPTIONS.map(d => d.label)}
                  onSelect={label => {
                    const found = DEPARTMENT_OPTIONS.find(
                      d => d.label === label,
                    );
                    if (found) setDepartment(found.value);
                  }}
                  error={errors.department}
                />
                <SelectInput
                  label={t('loginScreen.workShift')}
                  placeholder={t('loginScreen.selectWorkShift')}
                  value={workShift}
                  options={SHIFT_OPTIONS}
                  onSelect={setWorkShift}
                  error={errors.workShift}
                />
              </>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.88}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitText}>
                  {islogin
                    ? t('loginScreen.signIn')
                    : t('loginScreen.createAccount')}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {t('loginScreen.orContinueWith')}
              </Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>
          {/* Bottom switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {islogin
                ? t('loginScreen.noAccount')
                : t('loginScreen.haveAccount')}
            </Text>
            <TouchableOpacity onPress={() => handleTabSwitch(!islogin)}>
              <Text style={styles.switchLink}>
                {islogin
                  ? t('loginScreen.signUp')
                  : t('loginScreen.signInLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0fdf4' },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0fdf4',
  },
  orb1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45,106,79,0.12)',
    top: -60,
    right: -60,
  },
  orb2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(45,106,79,0.08)',
    top: 120,
    left: -50,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34,197,94,0.1)',
    bottom: 200,
    right: 20,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  brandBlock: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appTagline: { fontSize: 13, color: '#6b7280', fontWeight: '400' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  tabLabelActive: { color: '#1a1a1a' },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  greetingSub: { fontSize: 13, color: '#9ca3af', marginBottom: 24 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, color: '#2d6a4f', fontWeight: '600' },
  mismatchText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: { fontSize: 13, color: '#6b7280' },
  switchLink: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
});
