import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = "https://ajstuebuqxiftylnzdoy.supabase.co";
const supabaseAnonKey = "sb_publishable_IbEZwBvhZzrtHXJL52iwCA_TpNCWW5i";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ticketFrame = document.getElementById("ticket-frame");
const homeBtn = document.getElementById("home-btn");
document.addEventListener("DOMContentLoaded", ()=> {
    const fetchUser = async () => {
        const { data: user, error } = await supabase.auth.getUser();

        if(error){
            Swal.fire({
                title: "Error!",
                text: "You're not authenticated. Please signin.",
                icon: "error",
                confirmButtonText: "Okay",
            }).then(()=>{
                window.location.href = "student-login.html";
            })
            return;
        }
        homeBtn.style.display = "flex";
        const { data: ticket, error: fetchError } = await supabase
        .from("Event_Tickets")
        .select("*")
        .eq("name", "Unwind and Connect")
        .single();
        if(fetchError){
            Swal.fire({
                title: "Error!",
                text: "Error fetching ticket. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
        ticketFrame.src = ticket.ticket;
    }
    fetchUser();
    homeBtn.addEventListener("click", ()=>{
        window.location.href = "student-dashboard.html"
    })
})