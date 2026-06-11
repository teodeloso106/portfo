/* --------------------------------
    utilities 
-------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('yr').textContent = "2026";
        /* new Date().getFullYear(); */
    
    document.getElementById('mail-to').href = 
        window.APP_CONFIG.TEOMAILTO + window.APP_CONFIG.TEOEMAIL;

    document.getElementById('mail-to').text = 
        window.APP_CONFIG.TEOEMAIL;

    document.getElementById('linked-in').href = 
        window.APP_CONFIG.TEOLINKEDIN;
    
    document.getElementById('tlmanager-crdlnk').href = 
        window.APP_CONFIG.TLMANAGER;
    document.getElementById('tlmanager-crdlnk2').href = 
        window.APP_CONFIG.TLMANAGER;

    document.getElementById('btapp-crdlnk').href = 
        window.APP_CONFIG.BTAPP;
    document.getElementById('btapp-crdlnk2').href = 
        window.APP_CONFIG.BTAPP;

    
    /* re-define project section */

    const modal = document.getElementById('tooltip-modal');
    const modalText = document.getElementById('modal-text');
    const closeModalBtn = document.getElementById('close-modal');
    const textElements = document.querySelectorAll('.truncate-text');

    // Layout Checker function
    const checkTruncation = (element) => {
        // True if the text's natural scroll height is taller than its visible box height
        const isOverflowing = element.scrollHeight > element.clientHeight;
        
        if (isOverflowing) {
            element.classList.add('is-truncated'); // Triggers cursor: pointer;
        } else {
            element.classList.remove('is-truncated'); // Reverts to arrow pointer
        }
    };

    // watches for browser/card scaling changes and applies/removes cursors instantly
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            checkTruncation(entry.target);
        }
    });

    // Initialize tracking for every text element
    textElements.forEach(element => {
        // Run initial check right away
        checkTruncation(element);
        // Bind observer for future browser resizing actions
        resizeObserver.observe(element);

        // Click logic utilizing our new conditional class hook
        element.addEventListener('click', (e) => {
            if (element.classList.contains('is-truncated')) {
                // prevents the whole-card link from firing!
                e.stopPropagation(); 
                e.preventDefault();

                //const fullText = element.getAttribute('data-full-text');
                const fullText = e.target.textContent;
                modalText.textContent = fullText;
                modal.showModal();
            }
        });
    });

    // Close Modal Event handlers
    closeModalBtn.addEventListener('click', () => {
        modal.close();
    });
});
