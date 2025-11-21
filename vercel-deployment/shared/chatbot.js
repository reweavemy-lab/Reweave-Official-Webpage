// Shieldbase Chatbot Widget - Shared across all pages
(function(){
  window.SbaiConfig = {
    apiBase: "https://demo.sbai.cloud",
    appId: "ca61bc90-3fb9-4cde-a7ed-aef28d127c1a"
  };
  
  function initChatWidget() {
    if (document.getElementById('sbai-chat-btn')) return;
    
    var chatBtn = document.createElement("div");
    chatBtn.id = "sbai-chat-btn";
    chatBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 16 16" fill="white"><path d="M8.006 0a8.006 8.006 0 0 0-6.829 3.826 7.995 7.995 0 0 0-.295 7.818l-.804 2.402a1.48 1.48 0 0 0 1.877 1.876l2.403-.8a8.006 8.006 0 0 0 11.42-5.25 7.994 7.994 0 0 0-4.28-9.066A8.007 8.007 0 0 0 8.006 0Zm0 14.22a6.226 6.226 0 0 1-3.116-.836.89.89 0 0 0-.727-.074l-2.207.736.736-2.206a.888.888 0 0 0-.074-.727A6.218 6.218 0 0 1 7.19 1.831a6.227 6.227 0 0 1 6.565 3.784 6.218 6.218 0 0 1-1.96 7.318 6.227 6.227 0 0 1-3.789 1.286Z"></path></svg>';
    Object.assign(chatBtn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#4F00ED",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
      zIndex: "9999",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(79, 0, 237, 0.4)",
      border: "none"
    });
    
    var chatContainer = document.createElement("div");
    chatContainer.id = "sbai-chat-container";
    Object.assign(chatContainer.style, {
      position: "fixed",
      right: "20px",
      bottom: "90px",
      width: "400px",
      height: "600px",
      maxWidth: "calc(100vw - 40px)",
      maxHeight: "calc(100vh - 120px)",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      zIndex: "9998",
      opacity: "0",
      visibility: "hidden",
      transform: "translateY(20px)",
      transition: "all 0.3s ease",
      backgroundColor: "white",
      overflow: "hidden"
    });
    
    document.body.appendChild(chatBtn);
    document.body.appendChild(chatContainer);
    
    var isOpen = false;
    
    chatBtn.addEventListener("click", function() {
      isOpen = !isOpen;
      if (isOpen) {
        chatContainer.style.opacity = "1";
        chatContainer.style.visibility = "visible";
        chatContainer.style.transform = "translateY(0)";
        chatBtn.style.transform = "rotate(45deg)";
        if (!chatContainer.querySelector("iframe")) {
          var iframe = document.createElement("iframe");
          iframe.src = window.SbaiConfig.apiBase + "/chat/" + window.SbaiConfig.appId;
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
          iframe.style.borderRadius = "16px";
          iframe.allow = "microphone; camera";
          chatContainer.appendChild(iframe);
        }
      } else {
        chatContainer.style.opacity = "0";
        chatContainer.style.visibility = "hidden";
        chatContainer.style.transform = "translateY(20px)";
        chatBtn.style.transform = "rotate(0deg)";
      }
    });
    
    document.addEventListener("click", function(e) {
      if (isOpen && !chatBtn.contains(e.target) && !chatContainer.contains(e.target)) {
        isOpen = false;
        chatContainer.style.opacity = "0";
        chatContainer.style.visibility = "hidden";
        chatContainer.style.transform = "translateY(20px)";
        chatBtn.style.transform = "rotate(0deg)";
      }
    });
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();

