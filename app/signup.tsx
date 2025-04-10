import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/env';



type AuthResponse = {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    birthdate: string;
  };
  token: string;
};

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [open, setOpen] = useState(false);
const [gender, setGender] = useState('');
const [items, setItems] = useState([
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]);



  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.endsWith('.com');
  };

  const handleSignup = async () => {
    const tempErrors: Record<string, string> = {};

    if (!firstName) tempErrors.firstName = 'First name is required';
    if (!lastName) tempErrors.lastName = 'Last name is required';
    if (!username) tempErrors.username = 'Username is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!validateEmail(email)) tempErrors.email = 'Enter a valid email ending in .com';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';
    if (!phone) tempErrors.phone = 'Phone number is required';
    if (!gender) tempErrors.gender = 'Gender is required';
    if (!birthdate) tempErrors.birthdate = 'Birthdate is required';

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/signup`, {
        firstName,
        lastName,
        username,
        email,
        password,
        phone,
        gender,
        birthdate,
      });

      await AsyncStorage.setItem('token', res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ email: err?.response?.data?.message || 'Signup failed' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)/account')}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>

      {/* First Name */}
      <LabelInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.firstName}
      />

      {/* Last Name */}
      <LabelInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        error={errors.lastName}
      />

<LabelInput
  label="Username"
  value={username}
  onChangeText={setUsername}
  autoCapitalize="none"
  error={errors.username}
/>


      {/* Email */}
      <LabelInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      {/* Password */}
      <LabelInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      {/* Phone */}
      <LabelInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      {/* Gender Picker */}
      <Text style={styles.label}>Gender</Text>
      {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)}>
          <Picker.Item label="Select gender..." value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Birthdate Picker */}
<Text style={styles.label}>Birthdate</Text>
{errors.birthdate && <Text style={styles.error}>{errors.birthdate}</Text>}

<TouchableOpacity
  onPress={() => setShowDatePicker(true)}
  style={styles.input}
  activeOpacity={0.8}
>
  <Text style={{ color: birthdate ? '#000' : '#999' }}>
    {birthdate
      ? new Date(birthdate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Select birthdate'}
  </Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={birthdate ? new Date(birthdate) : new Date()}
    mode="date"
    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
    maximumDate={new Date()}
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const iso = selectedDate.toISOString().split('T')[0];
        setBirthdate(iso);
      }
    }}
  />
)}
{Platform.OS === 'web' ? (
  <TextInput
    style={styles.input}
    value={birthdate}
    onChangeText={setBirthdate}
    placeholder="YYYY-MM-DD"
  />
) : (
  <>
    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
      <Text style={{ color: birthdate ? '#000' : '#999' }}>
        {birthdate
          ? new Date(birthdate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Select birthdate'}
      </Text>
    </TouchableOpacity>
    {showDatePicker && (
      <DateTimePicker
        value={birthdate ? new Date(birthdate) : new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        maximumDate={new Date()}
        onChange={(event, selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) {
            const iso = selectedDate.toISOString().split('T')[0];
            setBirthdate(iso);
          }
        }}
      />
    )}
  </>
)}


      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const LabelInput = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'words',
  error,
}: {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    {error && <Text style={styles.error}>{error}</Text>}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  error: {
    color: '#e23744',
    fontSize: 13,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#e23744',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#e23744',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: '#e23744',
  },
  pickerWrapper: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
});
