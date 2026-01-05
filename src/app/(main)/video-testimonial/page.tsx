import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VideoTestimonialPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Video Testimonial</h1>
      <p className="text-sm text-gray-400">This page is empty for now. We will build the UI next.</p>
    </div>
  );
};

export default VideoTestimonialPage;
