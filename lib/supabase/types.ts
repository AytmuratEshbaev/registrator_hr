export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

// Vakansiyalar uchun arizalar turi
export type ApplicationRow = {
  id: string;
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  phone: string;
  phone_secondary: string | null;
  birth_date: string; // Vakansiya uchun tug'ilgan sana majburiy
  position_id: string | null;
  position_title: string;
  cv_url: string; // Rezyume majburiy
  passport_scan_url: string | null;
  diploma_url: string | null;
  photo_url: string | null;
  status: ApplicationStatus;
  hr_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationInsert = {
  id?: string;
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  phone_secondary?: string | null;
  birth_date: string;
  position_id?: string | null;
  position_title: string;
  cv_url: string;
  passport_scan_url?: string | null;
  diploma_url?: string | null;
  photo_url?: string | null;
  status?: ApplicationStatus;
  hr_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ApplicationUpdate = {
  id?: string;
  passport_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  phone?: string;
  phone_secondary?: string | null;
  birth_date?: string;
  position_id?: string | null;
  position_title?: string;
  cv_url?: string;
  passport_scan_url?: string | null;
  diploma_url?: string | null;
  photo_url?: string | null;
  status?: ApplicationStatus;
  hr_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

// O'quvchilar uchun arizalar turi
export type StudentApplicationRow = {
  id: string;
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  phone_secondary: string | null;
  grade: string;
  status: ApplicationStatus;
  hr_note: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentApplicationInsert = {
  id?: string;
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  phone_secondary?: string | null;
  grade: string;
  status?: ApplicationStatus;
  hr_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StudentApplicationUpdate = {
  id?: string;
  passport_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  phone_secondary?: string | null;
  grade?: string;
  status?: ApplicationStatus;
  hr_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PositionRow = {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type PositionInsert = {
  id?: string;
  title: string;
  description?: string | null;
  active?: boolean;
  created_at?: string;
};

export type PositionUpdate = {
  id?: string;
  title?: string;
  description?: string | null;
  active?: boolean;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: ApplicationRow;
        Insert: ApplicationInsert;
        Update: ApplicationUpdate;
        Relationships: [];
      };
      student_applications: {
        Row: StudentApplicationRow;
        Insert: StudentApplicationInsert;
        Update: StudentApplicationUpdate;
        Relationships: [];
      };
      positions: {
        Row: PositionRow;
        Insert: PositionInsert;
        Update: PositionUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
