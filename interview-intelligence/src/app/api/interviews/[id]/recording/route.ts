import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Recording Upload and Retrieval API
 *
 * Privacy-first approach:
 * - Uses private storage bucket (not public)
 * - Generates signed URLs with expiration for temporary access
 * - Enforces user ownership verification
 */

// Signed URL expiration time (1 hour)
const SIGNED_URL_EXPIRY = 3600;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("id")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !interview) {
      return NextResponse.json(
        { error: "Interview not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get("recording") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to PRIVATE storage bucket
    // File path includes user ID for security
    const fileName = `${user.id}/${interviewId}/recording-${Date.now()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("interview-recordings")
      .upload(fileName, buffer, {
        contentType: file.type || "video/webm",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Store the file path (NOT a public URL) in the database
    // The path will be used to generate signed URLs on-demand
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        recording_url: fileName, // Store path, not URL
      })
      .eq("id", interviewId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: `Failed to update interview: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Generate a signed URL for immediate use
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("interview-recordings")
      .createSignedUrl(fileName, SIGNED_URL_EXPIRY);

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError);
      // Still return success, but without URL
      return NextResponse.json({
        success: true,
        path: fileName,
        url: null,
        message: "Recording uploaded. URL will be available on next request.",
      });
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
      path: fileName,
    });
  } catch (error) {
    console.error("Recording upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}

// Get recording URL (generates fresh signed URL)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the recording path from database
    const { data, error } = await supabase
      .from("interviews")
      .select("recording_url")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.recording_url) {
      return NextResponse.json({ url: null });
    }

    // Generate a fresh signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("interview-recordings")
      .createSignedUrl(data.recording_url, SIGNED_URL_EXPIRY);

    if (signedUrlError) {
      console.error("Failed to create signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate recording URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error("Get recording error:", error);
    return NextResponse.json(
      { error: "Failed to get recording" },
      { status: 500 }
    );
  }
}

// Delete recording
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the recording path
    const { data, error: fetchError } = await supabase
      .from("interviews")
      .select("recording_url")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !data?.recording_url) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("interview-recordings")
      .remove([data.recording_url]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete recording" },
        { status: 500 }
      );
    }

    // Update interview record
    await supabase
      .from("interviews")
      .update({ recording_url: null })
      .eq("id", interviewId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete recording error:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
