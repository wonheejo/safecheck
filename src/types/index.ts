export type AlertStatus = 'ok' | 'warning_sent' | 'alert_sent';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  last_seen_at: string;
  inactivity_threshold_hours: number;
  grace_period_hours: number;
  reminder_frequency_hours: number;
  sleep_start_time: string | null;
  sleep_end_time: string | null;
  timezone: string;
  alert_status: AlertStatus;
  fcm_token: string | null;
  monitoring_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  source: 'app_open' | 'manual' | 'notification';
  created_at: string;
}

export interface AlertLog {
  id: string;
  user_id: string;
  alert_type: 'warning' | 'sms_alert';
  status: 'pending' | 'sent' | 'failed';
  message: string | null;
  sent_at: string | null;
  created_at: string;
}

export type CountryCode = 'KR' | 'JP' | 'SG' | 'ID' | 'PH' | 'MY' | 'VN' | 'US';

export interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  {code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷'},
  {code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵'},
  {code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬'},
  {code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩'},
  {code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭'},
  {code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾'},
  {code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳'},
  {code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸'},
];

export const INACTIVITY_THRESHOLDS = [
  {value: 24, labelKey: 'time.24hours'},
  {value: 48, labelKey: 'time.48hours'},
  {value: 72, labelKey: 'time.72hours'},
];

export const GRACE_PERIODS = [
  {value: 1, labelKey: 'time.1hour'},
  {value: 2, labelKey: 'time.2hours'},
  {value: 4, labelKey: 'time.4hours'},
];

export const REMINDER_FREQUENCIES = [
  {value: 1, labelKey: 'time.every1hour'},
  {value: 2, labelKey: 'time.every2hours'},
  {value: 4, labelKey: 'time.every4hours'},
  {value: 6, labelKey: 'time.every6hours'},
  {value: 12, labelKey: 'time.every12hours'},
];

export const SNOOZE_OPTIONS = [
  {value: 30, labelKey: 'time.30minutes'},
  {value: 60, labelKey: 'time.1hour'},
];
