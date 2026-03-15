import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Upload to storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("interview-recordings")
      .getPublicUrl(fileName);

    const recordingUrl = urlData.publicUrl;

    // Update interview with recording URL
    const { error: updateError } = await supabase
      .from("interviews")
      .update({ recording_url: recordingUrl })
      .eq("id", interviewId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: `Failed to update interview: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: recordingUrl });
  } catch (error) {
    console.error("Recording upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}

// Get recording URL
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

    const { data, error } = await supabase
      .from("interviews")
      .select("recording_url")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data?.recording_url || null });
  } catch (error) {
    console.error("Get recording error:", error);
    return NextResponse.json(
      { error: "Failed to get recording" },
      { status: 500 }
    );
  }
}
