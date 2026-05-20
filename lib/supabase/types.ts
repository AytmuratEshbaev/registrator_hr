export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

export type ApplicationRow = {
  id: string;
  passport_number: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  position_id: string | null;
  position_title: string;
  about: string;
  cv_url: string | null;
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
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  position_id?: string | null;
  position_title: string;
  about: string;
  cv_url?: string | null;
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
  full_name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  position_id?: string | null;
  position_title?: string;
  about?: string;
  cv_url?: string | null;
  passport_scan_url?: string | null;
  diploma_url?: string | null;
  photo_url?: string | null;
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
      positions: {
        Row: PositionRow;
        Insert: PositionInsert;
        Update: PositionUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
