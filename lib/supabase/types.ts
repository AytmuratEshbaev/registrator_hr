export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

export type ApplicationRow = {
  id: string;
  type: "student" | "vacancy";
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  phone: string;
  phone_secondary: string | null;
  birth_date: string | null;
  parent_name: string | null;
  grade: string | null;
  position_id: string | null;
  position_title: string | null;
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
  type: "student" | "vacancy";
  passport_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  phone_secondary?: string | null;
  birth_date?: string | null;
  parent_name?: string | null;
  grade?: string | null;
  position_id?: string | null;
  position_title?: string | null;
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
  type?: "student" | "vacancy";
  passport_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  phone?: string;
  phone_secondary?: string | null;
  birth_date?: string | null;
  parent_name?: string | null;
  grade?: string | null;
  position_id?: string | null;
  position_title?: string | null;
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
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
