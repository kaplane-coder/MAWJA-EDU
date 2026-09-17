export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "STUDENT" | "FORMATEUR" | "ADMIN";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type CourseStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type LessonContentType = "VIDEO" | "ARTICLE" | "QUIZ" | "ATTACHMENT";
export type OrderStatus = "PENDING_PAYMENT" | "PROOF_SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
export type PaymentMethod = "BARIDIMOB" | "CCP" | "BANK_TRANSFER" | "CASH";
export type PaymentRequestStatus = "PENDING" | "PROOF_SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
export type PaymentProofStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EnrollmentStatus = "ACTIVE" | "SUSPENDED" | "COMPLETED";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          username: string | null;
          bio: string | null;
          wilaya: string | null;
          city: string | null;
          interests: string[] | null;
          preferred_language: string | null;
          headline: string | null;
          specialization: string | null;
          experience_years: number | null;
          social_links: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          username?: string | null;
          bio?: string | null;
          wilaya?: string | null;
          city?: string | null;
          interests?: string[] | null;
          preferred_language?: string | null;
          headline?: string | null;
          specialization?: string | null;
          experience_years?: number | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          username?: string | null;
          bio?: string | null;
          wilaya?: string | null;
          city?: string | null;
          interests?: string[] | null;
          preferred_language?: string | null;
          headline?: string | null;
          specialization?: string | null;
          experience_years?: number | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      formateur_profiles: {
        Row: {
          id: string;
          bio: string | null;
          headline: string | null;
          social_links: Json;
          commission_rate: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          bio?: string | null;
          headline?: string | null;
          social_links?: Json;
          commission_rate?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio?: string | null;
          headline?: string | null;
          social_links?: Json;
          commission_rate?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "formateur_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      courses: {
        Row: {
          id: string;
          formateur_id: string;
          title: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          category: string | null;
          thumbnail_path: string | null;
          preview_video_path: string | null;
          price: number;
          level: CourseLevel;
          status: CourseStatus;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          formateur_id: string;
          title: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          category?: string | null;
          thumbnail_path?: string | null;
          preview_video_path?: string | null;
          price?: number;
          level: CourseLevel;
          status?: CourseStatus;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          formateur_id?: string;
          title?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          category?: string | null;
          thumbnail_path?: string | null;
          preview_video_path?: string | null;
          price?: number;
          level?: CourseLevel;
          status?: CourseStatus;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_formateur_id_fkey";
            columns: ["formateur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          content_type: LessonContentType;
          video_path: string | null;
          article_content: string | null;
          duration_seconds: number;
          is_free_preview: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          content_type: LessonContentType;
          video_path?: string | null;
          article_content?: string | null;
          duration_seconds?: number;
          is_free_preview?: boolean;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          content_type?: LessonContentType;
          video_path?: string | null;
          article_content?: string | null;
          duration_seconds?: number;
          is_free_preview?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "course_sections";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          student_id: string;
          total_amount: number;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          student_id: string;
          total_amount: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          student_id?: string;
          total_amount?: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          course_id: string;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          course_id: string;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          course_id?: string;
          unit_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_requests: {
        Row: {
          id: string;
          order_id: string;
          payment_method: PaymentMethod;
          amount: number;
          status: PaymentRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          payment_method: PaymentMethod;
          amount: number;
          status?: PaymentRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          payment_method?: PaymentMethod;
          amount?: number;
          status?: PaymentRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_proofs: {
        Row: {
          id: string;
          payment_request_id: string;
          sender_name: string;
          sender_account_reference: string | null;
          transaction_reference: string | null;
          proof_storage_path: string;
          file_hash: string | null;
          notes: string | null;
          submitted_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          status: PaymentProofStatus;
        };
        Insert: {
          id?: string;
          payment_request_id: string;
          sender_name: string;
          sender_account_reference?: string | null;
          transaction_reference?: string | null;
          proof_storage_path: string;
          file_hash?: string | null;
          notes?: string | null;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          status?: PaymentProofStatus;
        };
        Update: {
          id?: string;
          payment_request_id?: string;
          sender_name?: string;
          sender_account_reference?: string | null;
          transaction_reference?: string | null;
          proof_storage_path?: string;
          file_hash?: string | null;
          notes?: string | null;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          status?: PaymentProofStatus;
        };
        Relationships: [
          {
            foreignKeyName: "payment_proofs_payment_request_id_fkey";
            columns: ["payment_request_id"];
            isOneToOne: false;
            referencedRelation: "payment_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_proofs_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          order_id: string;
          status: EnrollmentStatus;
          enrolled_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          order_id: string;
          status?: EnrollmentStatus;
          enrolled_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          order_id?: string;
          status?: EnrollmentStatus;
          enrolled_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          target_entity: string;
          target_id: string | null;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          target_entity: string;
          target_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          target_entity?: string;
          target_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      student_lesson_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          progress_seconds: number;
          completed: boolean;
          completed_at: string | null;
          last_watched_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          course_id: string;
          progress_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          course_id?: string;
          progress_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_lesson_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_lesson_progress_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_formateur: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_enrolled_in_course: {
        Args: {
          p_course_id: string;
        };
        Returns: boolean;
      };
      admin_set_user_role: {
        Args: {
          target_user_id: string;
          new_role: UserRole;
        };
        Returns: undefined;
      };
      admin_approve_payment: {
        Args: {
          p_payment_proof_id: string;
        };
        Returns: undefined;
      };
      admin_reject_payment: {
        Args: {
          p_payment_proof_id: string;
          p_rejection_reason: string;
        };
        Returns: undefined;
      };
      student_create_manual_order: {
        Args: {
          p_course_id: string;
          p_payment_method: PaymentMethod;
        };
        Returns: Json;
      };
      student_cancel_order: {
        Args: {
          p_order_id: string;
        };
        Returns: undefined;
      };
      student_submit_payment_proof: {
        Args: {
          p_order_id: string;
          p_sender_name: string;
          p_sender_account_reference: string | null;
          p_transaction_reference: string | null;
          p_proof_storage_path: string;
          p_notes: string | null;
        };
        Returns: Json;
      };
      save_lesson_progress: {
        Args: {
          p_lesson_id: string;
          p_progress_seconds: number;
          p_completed?: boolean;
        };
        Returns: Json;
      };
      get_lesson_secure_content: {
        Args: {
          p_lesson_id: string;
        };
        Returns: Json;
      };
      admin_toggle_user_active: {
        Args: {
          target_user_id: string;
          new_is_active: boolean;
        };
        Returns: undefined;
      };
      admin_toggle_formateur_verified: {
        Args: {
          target_user_id: string;
          new_is_verified: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      course_level: CourseLevel;
      course_status: CourseStatus;
      lesson_content_type: LessonContentType;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_request_status: PaymentRequestStatus;
      payment_proof_status: PaymentProofStatus;
      enrollment_status: EnrollmentStatus;
    };
  };
}
