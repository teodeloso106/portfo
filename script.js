/* --------------------------------
    utilities 
-------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('yr').textContent = 
        new Date().getFullYear();
    
    document.getElementById('tlmanager-crdlnk').href = 
        window.APP_CONFIG.TLMANAGER;
    document.getElementById('tlmanager-crdlnk2').href = 
        window.APP_CONFIG.TLMANAGER;

    document.getElementById('mail-to').href = 
        window.APP_CONFIG.TEOMAILTO + window.APP_CONFIG.TEOEMAIL;

    document.getElementById('mail-to').text = 
        window.APP_CONFIG.TEOEMAIL;

    document.getElementById('linked-in').href = 
        window.APP_CONFIG.TEOLINKEDIN;
});
