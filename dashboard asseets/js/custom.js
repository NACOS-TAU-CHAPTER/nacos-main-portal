import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = "https://dgsipldaivnwxoyodzcw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2lwbGRhaXZud3hveW9kemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzExODEsImV4cCI6MjA1NDUwNzE4MX0.1YLPU_OhyG2CFwf8C4odEstPhL9Ico9lNYK8Lwg-AD0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const uploadForm = document.getElementById("upload-form");
const display_picture = document.getElementById("profile-pic");
document.addEventListener('DOMContentLoaded', function() {
    function reloadWithoutCache() {
        location.replace(location.pathname + "?nocache=" + new Date().getTime());
      }
    const uploadPfp = async (file) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Swal.fire({
                title: "Error!",
                text: "User not authenticated",
                icon: "error",
                confirmButtonText: "Okay",
            }).then(()=> {
                window.location.href = "student-login.html";
            })
            return;
        }
    
        const userId = user.id;
        const filePath = `display_pictures/${userId}.jpg`; // Unique path per user
    
        // Upload file to Supabase Storage (overwrite if exists)
        const { error: uploadError } = await supabase.storage
            .from("display_pictures")
            .upload(filePath, file, { upsert: true });
    
        if (uploadError) {
            Swal.fire({
                title: "Error!",
                text: "Error uploading image. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
    
        // Get the public URL of the uploaded image
        const { data } = supabase.storage.from("display_pictures").getPublicUrl(filePath);
        const imageUrl = data.publicUrl;
    
        // Store the image URL in the database
        const { error: updateError } = await supabase
            .from("Students")
            .update({ display_picture: imageUrl })
            .eq("id", userId);
    
        if (updateError) {
            Swal.fire({
                title: "Error!",
                text: "Error updating profile picture. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
    
        Swal.fire({
            title: "Success!",
            text: "Profile picture updated successfully.",
            icon: "success",
            confirmButtonText: "Okay",
        }).then(() => {
            sessionStorage.clear();
            reloadWithoutCache();
        });
    }
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        uploadPfp(display_picture.files[0])
    });

    // Function to fetch student data
    const fetchStudentData = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
        Swal.fire({
            title: "Error!",
            text: "User not authenticated",
            icon: "error",
            confirmButtonText: "Okay",
        }).then(()=>{
            window.location.href = "student-login.html";
        })
        return;
    }

    const userEmail = user.user?.email; // Get logged-in user email

    const { data, error: fetchError } = await supabase
        .from("Students")
        .select("*") // Select all columns, or specify them like: .select("name, matric_no, course")
        .eq("email", userEmail) // Filter data by user email
        .single(); // Expect only one record

    if (fetchError) {
        Swal.fire({
            title: "Error!",
            text: "Error fetching student data. Please refresh.",
            icon: "error",
            confirmButtonText: "Okay",
        })
        // console.error("Error fetching student data:", fetchError);
        return;
    }
    document.getElementById("student-name").textContent = data.name || "Unknown";
        document.getElementById("matric_no").textContent = data.matric_no || "N/A";
        document.getElementById("course").textContent = data.course || "N/A";
        document.getElementById("display_picture").src = data.display_picture;

    };


    // Call the function to fetch data
    fetchStudentData();

    const eventRsvp = async () =>{
        const { data: user, error } = await supabase.auth.getUser();

        if(error){
            Swal.fire({
                title: "Error!",
                text: "You're not authenticated. Please signin.",
                icon: "error",
                confirmButtonText: "Okay",
            })
            return;
        }
        const userId = user.id;
        const { data: existingStudent, error: checkError } = await supabase
              .from("Events")
              .select("*")
              .eq("id", userId)
              .single();
  
          if (checkError && checkError.code !== "PGRST116") { // Ignore "no rows found" error
              console.error("Error checking student:", checkError);
              Swal.fire({
                  title: "Error!",
                  text: "An error occurred while checking user data.",
                  icon: "error",
                  confirmButtonText: "Okay",
              });
              return;
          }
          if(existingStudent){
            Swal.fire({
                title: "Error!",
                text: "You already have a spot for this event. Download your ticket from your dashboard.",
                icon: "error",
                confirmButtonText: "Okay",
            })
          }else{
            const { error: insertError } = await supabase
            .from("Events")
            .insert([{
                matric_no: matricNo,
                id: userId, 
                unwind_and_connect: "RSVP",
            }]);
            if(insertError){
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred while trying to RSVP. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                });
                return;
            }
            Swal.fire({
                title: "Success!",
                text: "You have successfully RSVP'd for the event.",
                icon: "success",
                confirmButtonText: "Click here to download your ticket",
            }).then(()=>{
                //
            })
          }
        
        
    }
    document.getElementById("rsvp-btn").addEventListener("click", (e)=>{
        e.preventDefault();
        eventRsvp();
    })
});