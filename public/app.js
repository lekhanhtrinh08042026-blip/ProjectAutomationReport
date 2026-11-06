/* Automation Report — UI V1: Google sign-in, dashboard, local draft creation.
   Firebase authentication only runs when public/firebase-config.js is configured.
   Preview mode is explicit and NOT authenticated. No Excel engine in this milestone. */
"use strict";

(() => {
  const byId = (id) => document.getElementById(id);
  const els = {
    login: byId("loginScreen"),
    dashboard: byId("dashboardScreen"),
    googleLogin: byId("googleLogin"),
    demoLogin: byId("demoLogin"),
    loginStatus: byId("loginStatus"),
    demoBadge: byId("demoBadge"),
    userName: byId("userName"),
    userEmail: byId("userEmail"),
    avatar: byId("avatar"),
    greeting: byId("greetingSmall"),
    logout: byId("logoutButton"),
    create: byId("createReport"),
    dialog: byId("newReportDialog"),
    newReportForm: byId("newReportForm"),
    closeDialog: byId("closeDialog"),
    cancelDialog: byId("cancelDialog"),
    reportDate: byId("reportDate"),
    reportEngineer: byId("reportEngineer"),
    recent: byId("recentReports"),
    toast: byId("toast")
  };
  const state = { firebaseAuth: null, authApi: null, user: null, demo: false };
  let toastTimeout = null;

  const configured = () => {
    const config = window.FIREBASE_CONFIG;
    return Boolean(config && config.apiKey && config.authDomain && config.projectId && config.appId);
  };

  function setLoginMessage(message) {
    els.loginStatus.textContent = message;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    if (toastTimeout !== null) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { els.toast.hidden = true; }, 4200);
  }

  function showLogin() {
    els.login.hidden = false;
    els.dashboard.hidden = true;
    if (els.dialog.open) els.dialog.close();
    state.user = null;
    state.demo = false;
    if (!configured()) {
      setLoginMessage("Google Sign-In chưa được cấu hình. Bạn có thể chọn xem thử giao diện.");
    } else {
      setLoginMessage("");
    }
  }

  function showDashboard(user, isDemo) {
    state.user = user;
    state.demo = isDemo;
    els.login.hidden = true;
    els.dashboard.hidden = false;
    const fullName = (user.displayName || user.email || "Kỹ sư").trim();
    const firstName = fullName.split(/\s+/).filter(Boolean).slice(-1)[0] || "Kỹ sư";
    els.userName.textContent = fullName;
    els.userEmail.textContent = user.email || (isDemo ? "Không xác thực — bản xem thử" : "Đã xác thực");
    els.avatar.textContent = fullName.charAt(0).toLocaleUpperCase("vi-VN") || "E";
    els.greeting.textContent = `Xin chào, ${firstName} 👋`;
    els.demoBadge.hidden = !isDemo;
    renderReports();
  }

  function draftKey() {
    return `automation-report:drafts:v1:${state.demo ? "preview" : state.user?.uid || "unknown"}`;
  }

  function readDrafts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(draftKey()) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "object") : [];
    } catch (_) {
      return [];
    }
  }

  function writeDrafts(items) {
    try {
      localStorage.setItem(draftKey(), JSON.stringify(items));
      return true;
    } catch (_) {
      return false;
    }
  }

  function renderReports() {
    const drafts = readDrafts();
    els.recent.replaceChildren();
    if (drafts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-recent";
      empty.textContent = "Chưa có báo cáo nào. Nhấn “Tạo báo cáo” để bắt đầu.";
      els.recent.append(empty);
      return;
    }
    for (const draft of drafts.slice(0, 8)) {
      const row = document.createElement("article");
      row.className = "recent-row";
      const desc = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = `${draft.customer || "Khách hàng"} · ${draft.model || "Model"}`;
      const details = document.createElement("small");
      details.textContent = `${draft.serial ? `S/N: ${draft.serial} · ` : ""}${draft.date || ""} · ${draft.engineer || "Chưa nhập kỹ sư"}`;
      desc.append(title, details);
      const labels = document.createElement("div");
      const type = document.createElement("span");
      type.className = "report-pill";
      type.textContent = draft.type || "AMC";
      const status = document.createElement("span");
      status.className = "draft-tag";
      status.textContent = "Bản nháp";
      labels.append(type, status);
      row.append(desc, labels);
      els.recent.append(row);
    }
  }

  function localDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function openReportDialog() {
    els.newReportForm.reset();
    els.reportDate.value = localDateString();
    els.reportEngineer.value = state.demo ? "" : state.user?.displayName || "";
    els.dialog.showModal();
    byId("reportCustomer").focus();
  }

  function createReport(event) {
    event.preventDefault();
    if (!els.newReportForm.reportValidity()) return;
    const report = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: byId("reportType").value,
      customer: byId("reportCustomer").value.trim(),
      model: byId("reportModel").value.trim(),
      serial: byId("reportSerial").value.trim(),
      date: els.reportDate.value,
      engineer: els.reportEngineer.value.trim(),
      createdAt: new Date().toISOString(),
      status: "draft"
    };
    if (!report.customer || !report.model) {
      showToast("Vui lòng nhập Customer và Model.");
      return;
    }
    const saved = writeDrafts([report, ...readDrafts()]);
    els.dialog.close();
    renderReports();
    showToast(saved
      ? "Đã tạo bản nháp trên trình duyệt. Bước chọn Unit/Option sẽ phát triển tiếp."
      : "Đã tạo bản nháp trong phiên này, nhưng trình duyệt không cho phép lưu cục bộ.");
  }

  async function googleSignIn() {
    if (!configured()) {
      setLoginMessage("Chưa cấu hình Firebase. Hãy mở public/firebase-config.js và làm theo README.");
      return;
    }
    if (!state.firebaseAuth || !state.authApi) {
      setLoginMessage("Thư viện Google Sign-In chưa sẵn sàng. Hãy kiểm tra kết nối Internet.");
      return;
    }
    els.googleLogin.disabled = true;
    setLoginMessage("Đang mở cửa sổ đăng nhập Google...");
    try {
      const provider = new state.authApi.GoogleAuthProvider();
      await state.authApi.signInWithPopup(state.firebaseAuth, provider);
      setLoginMessage("");
    } catch (error) {
      const code = error && error.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setLoginMessage("Bạn đã đóng cửa sổ Google. Có thể thử lại.");
      } else if (code === "auth/unauthorized-domain") {
        setLoginMessage("Tên miền chưa được cho phép. Thêm localhost vào Firebase → Authentication → Authorized domains.");
      } else if (code === "auth/popup-blocked") {
        setLoginMessage("Trình duyệt đã chặn popup. Hãy cho phép cửa sổ bật lên và thử lại.");
      } else {
        setLoginMessage(`Đăng nhập chưa thành công (${code || "connection-error"}). Kiểm tra cấu hình Firebase.`);
      }
    } finally {
      els.googleLogin.disabled = false;
    }
  }

  async function logout() {
    if (state.demo) {
      showLogin();
      return;
    }
    if (state.firebaseAuth && state.authApi) {
      try {
        await state.authApi.signOut(state.firebaseAuth);
      } catch (_) {
        showToast("Không thể đăng xuất. Vui lòng thử lại.");
      }
    } else {
      showLogin();
    }
  }

  async function startFirebaseAuth() {
    if (!configured()) {
      showLogin();
      return;
    }
    try {
      const [appSdk, authSdk] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js")
      ]);
      const app = appSdk.initializeApp(window.FIREBASE_CONFIG);
      state.firebaseAuth = authSdk.getAuth(app);
      state.authApi = authSdk;
      authSdk.onAuthStateChanged(state.firebaseAuth, (user) => {
        if (state.demo) return; // Preview never masquerades as a verified login.
        if (user) showDashboard(user, false);
        else showLogin();
      }, () => {
        if (!state.demo) setLoginMessage("Không thể kiểm tra trạng thái đăng nhập. Kiểm tra kết nối và Firebase.");
      });
    } catch (error) {
      showLogin();
      setLoginMessage("Không tải được Firebase SDK. Kiểm tra kết nối mạng và cấu hình ứng dụng.");
      console.error("Firebase initialization error:", error);
    }
  }

  els.googleLogin.addEventListener("click", googleSignIn);
  els.demoLogin.addEventListener("click", () => showDashboard({
    uid: "preview", displayName: "Kỹ sư Demo", email: ""
  }, true));
  els.logout.addEventListener("click", logout);
  els.create.addEventListener("click", openReportDialog);
  els.closeDialog.addEventListener("click", () => els.dialog.close());
  els.cancelDialog.addEventListener("click", () => els.dialog.close());
  els.newReportForm.addEventListener("submit", createReport);
  // No client-side login simulation beyond the clearly labeled preview mode.
  startFirebaseAuth();
})();
