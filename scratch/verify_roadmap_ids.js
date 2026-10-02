const fs = require('fs');

const flowsData = JSON.parse(fs.readFileSync('graphify-out/flows_data.json', 'utf8'));

console.log('Flow 1 total nodes in json:', flowsData.flow1.nodes.length);
console.log('Flow 2 total nodes in json:', flowsData.flow2.nodes.length);
console.log('Flow 3 total nodes in json:', flowsData.flow3.nodes.length);

function checkIds(flowKey, ids) {
  const nodeIds = new Set(flowsData[flowKey].nodes.map(n => n.id));
  const missing = ids.filter(id => !nodeIds.has(id));
  console.log(`Checking ${flowKey}: ${ids.length} steps, missing:`, missing);
}

const f1Ids = [
  "start_node", "step01_user_select", "dec_auth_method", "step01a_user", "step01_client_google",
  "dec_popup", "step02_google", "step02_client_cb", "step03_server", "dec_jwks", "step03_query",
  "dec_user_exists", "step04_jit", "step04_sql", "step05_jwt_create", "step05_audit_db",
  "step05_jwt_return", "step06_client", "step07_dashboard", "end_session"
];

const f2Ids = [
  "offpage_from_flow01", "s", "a1", "a2", "sepay_node", "d2", "a3", "a4", "d4", "a5",
  "r2_node", "a5_client", "a6", "a7", "d7", "a8", "a9", "mailkit_node", "d9", "a9_server_record",
  "a10", "a10_server", "fptai_node", "d10", "a10_record_verif", "a11", "a11_client", "a12",
  "d12", "a13", "a13_client", "end"
];

const f3Ids = [
  "offpage_from_flow02", "s_start", "io_owner_config", "io_client_submit_config",
  "proc_server_save_settings", "proc_db_save_schedule", "io_client_render_card",
  "proc_worker_cron", "dec_worker_active_scan", "proc_trigger_grace", "proc_db_save_pending",
  "io_smtp_reminder", "io_owner_ping", "io_client_send_checkin", "dec_validate_checkin",
  "proc_reset_timer", "proc_db_save_checkin", "proc_client_pulse_active", "dec_worker_grace_scan",
  "proc_suspend_vault", "proc_db_save_suspension", "io_client_suspended_ui", "dec_has_executor",
  "proc_dispatch_exec_task", "proc_db_save_exec_task", "io_smtp_exec_alert", "io_exec_receive_alert",
  "dec_exec_action", "io_exec_submit_resp", "offpage_exec_death_claim", "proc_staged_reminders",
  "dec_freeze_reached", "proc_freeze_vault", "proc_db_save_freeze", "io_client_frozen_ui", "end_frozen"
];

checkIds('flow1', f1Ids);
checkIds('flow2', f2Ids);
checkIds('flow3', f3Ids);
