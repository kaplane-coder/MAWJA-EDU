import { createClient } from "@/lib/supabase/server";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentProofStatus,
  PaymentRequestStatus,
} from "@/types/database.types";

export interface StudentOrderItem {
  id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    price: number;
  };
  payment_request?: {
    id: string;
    payment_method: PaymentMethod;
    amount: number;
    status: PaymentRequestStatus;
  } | null;
  latest_proof?: {
    id: string;
    status: PaymentProofStatus;
    submitted_at: string;
    rejection_reason: string | null;
    proof_storage_path: string;
  } | null;
}

export interface AdminPaymentListItem {
  id: string;
  payment_request_id: string;
  sender_name: string;
  sender_account_reference: string | null;
  transaction_reference: string | null;
  proof_storage_path: string;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  status: PaymentProofStatus;
  amount: number;
  payment_method: PaymentMethod;
  order_id: string;
  order_number: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
  };
}

interface OrderQueryRow {
  id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    unit_price: number;
    courses: {
      id: string;
      title: string;
      slug: string;
      thumbnail_path: string | null;
      price: number;
    } | null;
  }> | null;
  payment_requests: Array<{
    id: string;
    payment_method: PaymentMethod;
    amount: number;
    status: PaymentRequestStatus;
    payment_proofs: Array<{
      id: string;
      status: PaymentProofStatus;
      submitted_at: string;
      rejection_reason: string | null;
      proof_storage_path: string;
      sender_name?: string;
      transaction_reference?: string | null;
      notes?: string | null;
    }> | null;
  }> | null;
}

interface EnrolledCourseQueryRow {
  id: string;
  status: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    thumbnail_path: string | null;
    level: string;
    category: string | null;
    profiles: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    } | null;
    course_sections: Array<{
      id: string;
      lessons: Array<{
        id: string;
        duration_seconds: number | null;
      }> | null;
    }> | null;
  } | null;
}

interface AdminPaymentQueryRow {
  id: string;
  payment_request_id: string;
  sender_name: string;
  sender_account_reference: string | null;
  transaction_reference: string | null;
  proof_storage_path: string;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  status: PaymentProofStatus;
  payment_requests: {
    id: string;
    payment_method: PaymentMethod;
    amount: number;
    orders: {
      id: string;
      order_number: string;
      profiles: {
        id: string;
        full_name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
      } | null;
      order_items: Array<{
        courses: {
          id: string;
          title: string;
          slug: string;
          price: number;
        } | null;
      }> | null;
    } | null;
  } | null;
}

/**
 * Retrieves all orders created by a student
 */
export async function getStudentOrders(
  studentId: string
): Promise<StudentOrderItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      total_amount,
      status,
      created_at,
      updated_at,
      order_items (
        unit_price,
        courses (
          id,
          title,
          slug,
          thumbnail_path,
          price
        )
      ),
      payment_requests (
        id,
        payment_method,
        amount,
        status,
        payment_proofs (
          id,
          status,
          submitted_at,
          rejection_reason,
          proof_storage_path
        )
      )
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as OrderQueryRow[];

  return rows.map((order) => {
    const item = order.order_items?.[0];
    const course = item?.courses || {
      id: "",
      title: "دورة تدريبية",
      slug: "",
      thumbnail_path: null,
      price: order.total_amount,
    };
    const req = order.payment_requests?.[0];
    const proofs = req?.payment_proofs || [];
    const latestProof = proofs.length > 0 ? proofs[proofs.length - 1] : null;

    return {
      id: order.id,
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      course,
      payment_request: req
        ? {
            id: req.id,
            payment_method: req.payment_method,
            amount: Number(req.amount),
            status: req.status,
          }
        : null,
      latest_proof: latestProof,
    };
  });
}

/**
 * Retrieves a specific order for payment instructions & proof submission
 */
export async function getStudentOrderForPayment(
  orderId: string,
  studentId: string
): Promise<StudentOrderItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      total_amount,
      status,
      created_at,
      updated_at,
      order_items (
        unit_price,
        courses (
          id,
          title,
          slug,
          thumbnail_path,
          price
        )
      ),
      payment_requests (
        id,
        payment_method,
        amount,
        status,
        payment_proofs (
          id,
          status,
          sender_name,
          transaction_reference,
          submitted_at,
          rejection_reason,
          proof_storage_path,
          notes
        )
      )
    `
    )
    .eq("id", orderId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const order = data as unknown as OrderQueryRow;
  const item = order.order_items?.[0];
  const course = item?.courses || {
    id: "",
    title: "دورة تدريبية",
    slug: "",
    thumbnail_path: null,
    price: order.total_amount,
  };
  const req = order.payment_requests?.[0];
  const proofs = req?.payment_proofs || [];
  const latestProof = proofs.length > 0 ? proofs[proofs.length - 1] : null;

  return {
    id: order.id,
    order_number: order.order_number,
    total_amount: Number(order.total_amount),
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
    course,
    payment_request: req
      ? {
          id: req.id,
          payment_method: req.payment_method,
          amount: Number(req.amount),
          status: req.status,
        }
      : null,
    latest_proof: latestProof,
  };
}

/**
 * Checks if student is actively enrolled in a course
 */
export async function checkStudentEnrollment(
  courseId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Retrieves all actively enrolled courses for a student
 */
export async function getStudentEnrolledCourses(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      status,
      enrolled_at,
      courses (
        id,
        title,
        slug,
        short_description,
        description,
        thumbnail_path,
        level,
        category,
        profiles:formateur_id (
          id,
          full_name,
          avatar_url
        ),
        course_sections (
          id,
          lessons (
            id,
            duration_seconds
          )
        )
      )
    `
    )
    .eq("student_id", studentId)
    .eq("status", "ACTIVE")
    .order("enrolled_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  // Fetch all completed lessons for this student
  const { data: progressData } = await supabase
    .from("student_lesson_progress")
    .select("course_id, completed")
    .eq("student_id", studentId)
    .eq("completed", true);

  const completedMap = new Map<string, number>();
  if (progressData) {
    progressData.forEach((p) => {
      const current = completedMap.get(p.course_id) || 0;
      completedMap.set(p.course_id, current + 1);
    });
  }

  const rows = data as unknown as EnrolledCourseQueryRow[];

  return rows.map((enr) => {
    const course = enr.courses;
    let lessonCount = 0;
    let totalDurationSeconds = 0;

    if (course?.course_sections) {
      course.course_sections.forEach((sec) => {
        if (sec.lessons) {
          lessonCount += sec.lessons.length;
          sec.lessons.forEach((les) => {
            totalDurationSeconds += les.duration_seconds || 0;
          });
        }
      });
    }

    const completedLessons = course?.id ? completedMap.get(course.id) || 0 : 0;
    const progressPercentage =
      lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;

    return {
      enrollment_id: enr.id,
      enrolled_at: enr.enrolled_at,
      course: {
        id: course?.id || "",
        title: course?.title || "",
        slug: course?.slug || "",
        short_description: course?.short_description || null,
        thumbnail_path: course?.thumbnail_path || null,
        level: course?.level || "BEGINNER",
        category: course?.category || null,
        instructor: {
          id: course?.profiles?.id || "",
          full_name: course?.profiles?.full_name || "مدرب معتمد",
          avatar_url: course?.profiles?.avatar_url || null,
        },
        stats: {
          sectionCount: course?.course_sections?.length || 0,
          lessonCount,
          completedLessons,
          progressPercentage,
          totalDurationSeconds,
        },
      },
    };
  });
}

/**
 * Retrieves payment proofs for Admin review dashboard
 */
export async function getAdminPaymentsList(
  statusFilter?: PaymentProofStatus
): Promise<AdminPaymentListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("payment_proofs")
    .select(
      `
      id,
      payment_request_id,
      sender_name,
      sender_account_reference,
      transaction_reference,
      proof_storage_path,
      notes,
      submitted_at,
      reviewed_at,
      rejection_reason,
      status,
      payment_requests (
        id,
        payment_method,
        amount,
        orders (
          id,
          order_number,
          profiles:student_id (
            id,
            full_name,
            email,
            phone,
            avatar_url
          ),
          order_items (
            courses (
              id,
              title,
              slug,
              price
            )
          )
        )
      )
    `
    )
    .order("submitted_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as AdminPaymentQueryRow[];

  return rows.map((proof) => {
    const req = proof.payment_requests;
    const order = req?.orders;
    const student = order?.profiles || {
      id: "",
      full_name: "طالب",
      email: "",
      phone: null,
      avatar_url: null,
    };
    const course = order?.order_items?.[0]?.courses || {
      id: "",
      title: "دورة تدريبية",
      slug: "",
      price: req?.amount || 0,
    };

    return {
      id: proof.id,
      payment_request_id: proof.payment_request_id,
      sender_name: proof.sender_name,
      sender_account_reference: proof.sender_account_reference,
      transaction_reference: proof.transaction_reference,
      proof_storage_path: proof.proof_storage_path,
      notes: proof.notes,
      submitted_at: proof.submitted_at,
      reviewed_at: proof.reviewed_at,
      rejection_reason: proof.rejection_reason,
      status: proof.status,
      amount: Number(req?.amount || 0),
      payment_method: req?.payment_method || "BARIDIMOB",
      order_id: order?.id || "",
      order_number: order?.order_number || "—",
      student,
      course,
    };
  });
}

/**
 * Retrieves a single payment proof detail for Admin inspection
 */
export async function getAdminPaymentDetail(
  paymentProofId: string
): Promise<AdminPaymentListItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_proofs")
    .select(
      `
      id,
      payment_request_id,
      sender_name,
      sender_account_reference,
      transaction_reference,
      proof_storage_path,
      notes,
      submitted_at,
      reviewed_at,
      rejection_reason,
      status,
      payment_requests (
        id,
        payment_method,
        amount,
        orders (
          id,
          order_number,
          profiles:student_id (
            id,
            full_name,
            email,
            phone,
            avatar_url
          ),
          order_items (
            courses (
              id,
              title,
              slug,
              price
            )
          )
        )
      )
    `
    )
    .eq("id", paymentProofId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const proof = data as unknown as AdminPaymentQueryRow;
  const req = proof.payment_requests;
  const order = req?.orders;
  const student = order?.profiles || {
    id: "",
    full_name: "طالب",
    email: "",
    phone: null,
    avatar_url: null,
  };
  const course = order?.order_items?.[0]?.courses || {
    id: "",
    title: "دورة تدريبية",
    slug: "",
    price: req?.amount || 0,
  };

  return {
    id: proof.id,
    payment_request_id: proof.payment_request_id,
    sender_name: proof.sender_name,
    sender_account_reference: proof.sender_account_reference,
    transaction_reference: proof.transaction_reference,
    proof_storage_path: proof.proof_storage_path,
    notes: proof.notes,
    submitted_at: proof.submitted_at,
    reviewed_at: proof.reviewed_at,
    rejection_reason: proof.rejection_reason,
    status: proof.status,
    amount: Number(req?.amount || 0),
    payment_method: req?.payment_method || "BARIDIMOB",
    order_id: order?.id || "",
    order_number: order?.order_number || "—",
    student,
    course,
  };
}

/**
 * Generates a short-lived (60 minutes) signed download URL for private payment proof receipts
 */
export async function getProofSignedUrl(
  storagePath: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("private-proofs")
    .createSignedUrl(storagePath, 3600); // 60 minutes

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
