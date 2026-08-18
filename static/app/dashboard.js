/**
 * Dashboard JavaScript - allusersheets.html
 * This file is loaded separately to avoid formatter issues with Jinja2 templates
 */

// Global variable to store list counts - read from data attribute to avoid formatter issues
var listCounts = {};

// Initialize list counts from data attribute
(function () {
    var dataEl = document.getElementById('listCountsData');
    if (dataEl && dataEl.dataset.counts) {
        try {
            listCounts = JSON.parse(dataEl.dataset.counts);
        } catch (e) {
            console.error('Error parsing list counts:', e);
            listCounts = {};
        }
    }
})();

// --- UI Helpers ---
// Close dropdown when clicking outside
window.onclick = function (event) {
    if (!event.target.closest('.dropdown-container')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function filterLists() {
    var input, filter, container, items, span, i, txtValue;
    input = document.getElementById("listSearchInput");
    filter = input.value.toUpperCase();
    // Get all items with class "list-item" inside dropdown
    items = document.querySelectorAll("#listsDropdown .list-item");

    for (i = 0; i < items.length; i++) {
        span = items[i].getElementsByTagName("span")[0];
        if (span) {
            txtValue = span.textContent || span.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                items[i].style.display = "";
            } else {
                items[i].style.display = "none";
            }
        }
    }
}

function toggleListDropdown(event) {
    event.stopPropagation();
    document.getElementById("listsDropdown").classList.toggle("show");
}

function switchToList(listName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(function (el) {
        el.classList.remove('active');
    });

    // Show selected
    var tabContent = document.getElementById('tab-content-' + listName);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Update Active Name
    var count = listCounts[listName] !== undefined ? listCounts[listName] : 0;
    var activeSpan = document.getElementById('active-list-name');
    activeSpan.innerHTML = listName + ' <span class="header-count-badge">(' + count + ' files)</span>';
    activeSpan.setAttribute('data-list-name', listName);

    // Close dropdown
    document.getElementById("listsDropdown").classList.remove("show");
}

function openCreateSheet() {
    // Get current active list name from data attribute
    var currentList = document.getElementById('active-list-name').getAttribute('data-list-name');
    if (!currentList) currentList = 'Default';
    doAction('default', 'edit', currentList);
}

// --- Action Form Submission ---
function doAction(pagename, action, listname) {
    if (listname === undefined) listname = 'Default';

    document.getElementById("pagename").value = pagename;
    document.getElementById("listname").value = listname;

    document.getElementById("edit").value = "no";
    document.getElementById("view").value = "no";
    document.getElementById("delete").value = "no";

    document.getElementById(action).value = "yes";
    document.getElementById("actionForm").submit();
}

// --- List Operations ---
function openCreateListModal() {
    document.getElementById('createListModal').style.display = 'flex';
    document.getElementById('newListName').focus();
}

function closeCreateListModal() {
    document.getElementById('createListModal').style.display = 'none';
}

function createList() {
    var name = document.getElementById('newListName').value;
    if (!name) return;

    fetch('/list/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'list_name=' + encodeURIComponent(name)
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.success) location.reload();
            else alert(data.error);
        });
}

function confirmDeleteList(listName) {
    var check = prompt('To delete list "' + listName + '" and ALL files inside, type "confirm" below:');
    if (check && check.toLowerCase() === 'confirm') {
        fetch('/list/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'list_name=' + encodeURIComponent(listName)
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.success) location.reload();
                else alert(data.error);
            });
    }
}

// --- Move Operations ---
function openMoveModal(fname, srcList) {
    document.getElementById('moveFileName').value = fname;
    document.getElementById('moveFileSrcList').value = srcList;
    document.getElementById('moveFileMsg').innerText = 'Move "' + fname + '" from ' + srcList + ' to:';

    // Reset selection
    document.getElementById('moveFileDestList').value = '';
    var items = document.querySelectorAll('.modal-list-item');
    items.forEach(function (el) { el.classList.remove('selected'); });

    document.getElementById('moveFileModal').style.display = 'flex';
}

function selectMoveDest(element, listName) {
    // Clear previous selection
    var items = document.querySelectorAll('.modal-list-item');
    items.forEach(function (el) { el.classList.remove('selected'); });

    // Set new selection
    element.classList.add('selected');
    document.getElementById('moveFileDestList').value = listName;
}

function closeMoveModal() {
    document.getElementById('moveFileModal').style.display = 'none';
}

function moveFile() {
    var fname = document.getElementById('moveFileName').value;
    var src = document.getElementById('moveFileSrcList').value;
    var dest = document.getElementById('moveFileDestList').value;

    if (!dest) {
        alert("Please select a destination list.");
        return;
    }

    if (src === dest) {
        closeMoveModal();
        return;
    }

    fetch('/list/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'fname=' + encodeURIComponent(fname) + '&src_list=' + encodeURIComponent(src) + '&dest_list=' + encodeURIComponent(dest)
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.success) location.reload();
            else alert(data.error);
        });
}

// --- Auto-Switch on Load ---
document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    var activeList = urlParams.get('active_list');
    if (activeList) {
        // Verify list exists in DOM before switching to avoid errors
        if (document.getElementById('tab-content-' + activeList)) {
            switchToList(activeList);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});


// ============================================
// BULK UPLOAD FUNCTIONALITY
// ============================================

var bulkUploadSelectedFiles = [];
var bulkUploadDuplicateActions = {};

function openBulkUploadModal() {
    var currentList = document.getElementById('active-list-name').getAttribute('data-list-name') || 'Default';
    document.getElementById('bulkUploadListName').textContent = currentList;

    // Reset state
    bulkUploadSelectedFiles = [];
    bulkUploadDuplicateActions = {};
    document.getElementById('bulkUploadFiles').value = '';
    document.getElementById('bulkUploadFileCount').textContent = 'No files selected';
    document.getElementById('bulkUploadDuplicatesSection').style.display = 'none';
    document.getElementById('bulkUploadProgress').style.display = 'none';
    document.getElementById('bulkUploadResults').style.display = 'none';
    document.getElementById('bulkUploadSubmitBtn').disabled = false;
    document.getElementById('bulkUploadSubmitBtn').textContent = 'Upload';

    document.getElementById('bulkUploadModal').style.display = 'flex';

    // Add file change listener
    document.getElementById('bulkUploadFiles').onchange = handleBulkUploadFileSelect;
}

function closeBulkUploadModal() {
    document.getElementById('bulkUploadModal').style.display = 'none';
}

function handleBulkUploadFileSelect(event) {
    var files = event.target.files;
    if (files.length > 300) {
        alert('Maximum 300 files allowed. Please select fewer files.');
        event.target.value = '';
        document.getElementById('bulkUploadFileCount').textContent = 'No files selected';
        return;
    }

    bulkUploadSelectedFiles = Array.from(files);
    document.getElementById('bulkUploadFileCount').textContent = files.length + ' file(s) selected';

    // Check for duplicates
    checkForDuplicates();
}

function checkForDuplicates() {
    var currentList = document.getElementById('bulkUploadListName').textContent;
    var filenames = bulkUploadSelectedFiles.map(function (f) { return f.name; });

    fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_name: currentList, filenames: filenames })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.duplicates && data.duplicates.length > 0) {
                showDuplicatesSection(data.duplicates);
            } else {
                document.getElementById('bulkUploadDuplicatesSection').style.display = 'none';
                bulkUploadDuplicateActions = {};
            }
        })
        .catch(function (err) {
            console.error('Error checking duplicates:', err);
        });
}

function showDuplicatesSection(duplicates) {
    var container = document.getElementById('bulkUploadDuplicatesList');
    var html = '';

    duplicates.forEach(function (dup) {
        var originalName = dup.original;
        var cleanName = dup.clean;
        // Default to skip
        bulkUploadDuplicateActions[originalName] = 'skip';

        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #ffe0b2;">';
        html += '<span style="font-size: 0.85rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + originalName + '">' + cleanName + '</span>';
        html += '<select onchange="setDuplicateAction(\'' + originalName.replace(/'/g, "\\'") + '\', this.value)" style="padding: 0.3rem; font-size: 0.8rem; border-radius: 4px; border: 1px solid #ccc;">';
        html += '<option value="skip" selected>Skip</option>';
        html += '<option value="replace">Replace</option>';
        html += '</select>';
        html += '</div>';
    });

    container.innerHTML = html;
    document.getElementById('bulkUploadDuplicatesSection').style.display = 'block';
}

function setDuplicateAction(filename, action) {
    bulkUploadDuplicateActions[filename] = action;
}

function setAllDuplicateActions(action) {
    var selects = document.querySelectorAll('#bulkUploadDuplicatesList select');
    selects.forEach(function (select) {
        select.value = action;
        var filename = select.parentElement.querySelector('span').title;
        bulkUploadDuplicateActions[filename] = action;
    });

    // Update the stored actions for all duplicates
    Object.keys(bulkUploadDuplicateActions).forEach(function (key) {
        bulkUploadDuplicateActions[key] = action;
    });
}

function submitBulkUpload() {
    if (bulkUploadSelectedFiles.length === 0) {
        alert('Please select files to upload.');
        return;
    }

    var currentList = document.getElementById('bulkUploadListName').textContent;

    // Show progress
    document.getElementById('bulkUploadProgress').style.display = 'block';
    document.getElementById('bulkUploadSubmitBtn').disabled = true;
    document.getElementById('bulkUploadSubmitBtn').textContent = 'Uploading...';

    var formData = new FormData();
    formData.append('list_name', currentList);
    formData.append('duplicate_action', JSON.stringify(bulkUploadDuplicateActions));

    bulkUploadSelectedFiles.forEach(function (file) {
        formData.append('files', file);
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/bulk-upload', true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            var percent = Math.round((e.loaded / e.total) * 100);
            document.getElementById('bulkUploadProgressBar').style.width = percent + '%';
            document.getElementById('bulkUploadProgressText').textContent = percent + '%';
        }
    };

    xhr.onload = function () {
        document.getElementById('bulkUploadProgress').style.display = 'none';

        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            showBulkUploadResults(response);
        } else {
            alert('Upload failed. Please try again.');
            document.getElementById('bulkUploadSubmitBtn').disabled = false;
            document.getElementById('bulkUploadSubmitBtn').textContent = 'Upload';
        }
    };

    xhr.onerror = function () {
        document.getElementById('bulkUploadProgress').style.display = 'none';
        alert('Upload failed. Please try again.');
        document.getElementById('bulkUploadSubmitBtn').disabled = false;
        document.getElementById('bulkUploadSubmitBtn').textContent = 'Upload';
    };

    xhr.send(formData);
}

function showBulkUploadResults(response) {
    var results = response.results;
    var html = '';

    if (response.total_uploaded > 0) {
        html += '<div style="color: #2e7d32;">✓ ' + response.total_uploaded + ' file(s) uploaded</div>';
    }
    if (response.total_replaced > 0) {
        html += '<div style="color: #1565c0;">↻ ' + response.total_replaced + ' file(s) replaced</div>';
    }
    if (response.total_skipped > 0) {
        html += '<div style="color: #757575;">⊘ ' + response.total_skipped + ' file(s) skipped</div>';
    }
    if (response.total_failed > 0) {
        html += '<div style="color: #c62828;">✗ ' + response.total_failed + ' file(s) failed</div>';
    }

    document.getElementById('bulkUploadResultsText').innerHTML = html;
    document.getElementById('bulkUploadResults').style.display = 'block';
    document.getElementById('bulkUploadDuplicatesSection').style.display = 'none';

    document.getElementById('bulkUploadSubmitBtn').textContent = 'Done';
    document.getElementById('bulkUploadSubmitBtn').onclick = function () {
        closeBulkUploadModal();
        location.reload();
    };
    document.getElementById('bulkUploadSubmitBtn').disabled = false;
}


// ============================================
// BULK DOWNLOAD FUNCTIONALITY
// ============================================

var bulkDownloadMaxFiles = 0;

function openBulkDownloadModal() {
    var currentList = document.getElementById('active-list-name').getAttribute('data-list-name') || 'Default';
    document.getElementById('bulkDownloadListName').textContent = currentList;

    // Reset state
    document.getElementById('bulkDownloadStart').value = 1;
    document.getElementById('bulkDownloadEnd').value = 1;
    document.getElementById('bulkDownloadFileCount').textContent = 'Loading file count...';
    document.getElementById('bulkDownloadSelectedCount').innerHTML = 'Will download: <strong>1 file</strong>';
    document.getElementById('bulkDownloadSubmitBtn').disabled = true;

    document.getElementById('bulkDownloadModal').style.display = 'flex';

    // Fetch file count for the list
    fetch('/api/list-files?list_name=' + encodeURIComponent(currentList))
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.error) {
                document.getElementById('bulkDownloadFileCount').textContent = 'Error: ' + data.error;
                return;
            }

            bulkDownloadMaxFiles = data.count;

            if (bulkDownloadMaxFiles === 0) {
                document.getElementById('bulkDownloadFileCount').textContent = 'No files in this list';
                document.getElementById('bulkDownloadSubmitBtn').disabled = true;
            } else {
                document.getElementById('bulkDownloadFileCount').textContent = 'Total files: ' + bulkDownloadMaxFiles;
                document.getElementById('bulkDownloadStart').max = bulkDownloadMaxFiles;
                document.getElementById('bulkDownloadEnd').max = bulkDownloadMaxFiles;
                document.getElementById('bulkDownloadEnd').value = bulkDownloadMaxFiles;
                document.getElementById('bulkDownloadSubmitBtn').disabled = false;
                updateBulkDownloadCount();
            }
        })
        .catch(function (err) {
            console.error('Error fetching file count:', err);
            document.getElementById('bulkDownloadFileCount').textContent = 'Error fetching file count';
        });

    // Add listeners for range inputs
    document.getElementById('bulkDownloadStart').onchange = updateBulkDownloadCount;
    document.getElementById('bulkDownloadEnd').onchange = updateBulkDownloadCount;
    document.getElementById('bulkDownloadStart').oninput = updateBulkDownloadCount;
    document.getElementById('bulkDownloadEnd').oninput = updateBulkDownloadCount;
}

function closeBulkDownloadModal() {
    document.getElementById('bulkDownloadModal').style.display = 'none';
}

function updateBulkDownloadCount() {
    var start = parseInt(document.getElementById('bulkDownloadStart').value) || 1;
    var end = parseInt(document.getElementById('bulkDownloadEnd').value) || 1;

    // Clamp values
    start = Math.max(1, Math.min(start, bulkDownloadMaxFiles));
    end = Math.max(1, Math.min(end, bulkDownloadMaxFiles));

    if (start > end) {
        var temp = start;
        start = end;
        end = temp;
    }

    var count = end - start + 1;
    var format = count === 1 ? '.msc file' : '.zip archive';

    document.getElementById('bulkDownloadSelectedCount').innerHTML =
        'Will download: <strong>' + count + ' file(s)</strong> as ' + format;
}

function submitBulkDownload() {
    var currentList = document.getElementById('bulkDownloadListName').textContent;
    var start = parseInt(document.getElementById('bulkDownloadStart').value) || 1;
    var end = parseInt(document.getElementById('bulkDownloadEnd').value) || 1;

    // Clamp values
    start = Math.max(1, Math.min(start, bulkDownloadMaxFiles));
    end = Math.max(1, Math.min(end, bulkDownloadMaxFiles));

    if (start > end) {
        var temp = start;
        start = end;
        end = temp;
    }

    // Create form and submit
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/bulk-download';
    form.style.display = 'none';

    var listInput = document.createElement('input');
    listInput.name = 'list_name';
    listInput.value = currentList;
    form.appendChild(listInput);

    var startInput = document.createElement('input');
    startInput.name = 'start_index';
    startInput.value = start;
    form.appendChild(startInput);

    var endInput = document.createElement('input');
    endInput.name = 'end_index';
    endInput.value = end;
    form.appendChild(endInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    closeBulkDownloadModal();
}

// --- Delete All Operations ---
var deleteAllListName = '';
var deleteAllFilesList = [];

function openDeleteAllModal() {
    // Get current active list name
    var currentList = document.getElementById('active-list-name').getAttribute('data-list-name') || 'Default';
    deleteAllListName = currentList;

    // Update modal with list info
    document.getElementById('deleteAllListName').textContent = currentList;

    // Get file count for this list
    var count = listCounts[currentList] || 0;
    document.getElementById('deleteAllFileCount').textContent = count;

    // Reset form
    document.getElementById('deleteAllConfirmInput').value = '';
    document.getElementById('deleteAllSubmitBtn').disabled = true;
    document.getElementById('deleteAllProgress').style.display = 'none';
    document.getElementById('deleteAllResults').style.display = 'none';

    // Add input listener for confirmation
    var confirmInput = document.getElementById('deleteAllConfirmInput');
    confirmInput.oninput = function () {
        var submitBtn = document.getElementById('deleteAllSubmitBtn');
        if (confirmInput.value === deleteAllListName) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    };

    // Show modal
    document.getElementById('deleteAllModal').style.display = 'flex';
    confirmInput.focus();
}

function closeDeleteAllModal() {
    document.getElementById('deleteAllModal').style.display = 'none';
}

function submitDeleteAll() {
    var confirmInput = document.getElementById('deleteAllConfirmInput');

    // Double-check confirmation
    if (confirmInput.value !== deleteAllListName) {
        alert('Please type the exact list name to confirm deletion.');
        return;
    }

    // Disable button and show progress
    document.getElementById('deleteAllSubmitBtn').disabled = true;
    document.getElementById('deleteAllProgress').style.display = 'block';
    document.getElementById('deleteAllProgressBar').style.width = '0%';
    document.getElementById('deleteAllProgressText').textContent = 'Starting...';

    // Send delete request
    fetch('/api/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_name: deleteAllListName })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            document.getElementById('deleteAllProgress').style.display = 'none';

            if (data.success) {
                document.getElementById('deleteAllResults').style.display = 'block';
                document.getElementById('deleteAllResultsText').innerHTML =
                    'Successfully deleted <strong>' + data.deleted_count + '</strong> file(s) from <strong>' + deleteAllListName + '</strong>.';

                // Update local count
                listCounts[deleteAllListName] = 0;

                // Reload page after short delay
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                document.getElementById('deleteAllResults').style.display = 'block';
                document.getElementById('deleteAllResults').style.backgroundColor = '#ffebee';
                document.getElementById('deleteAllResults').style.borderColor = '#ffcdd2';
                document.getElementById('deleteAllResultsText').innerHTML =
                    '<span style="color: #c62828;">Error: ' + (data.error || 'Unknown error') + '</span>';
            }
        })
        .catch(function (err) {
            document.getElementById('deleteAllProgress').style.display = 'none';
            document.getElementById('deleteAllResults').style.display = 'block';
            document.getElementById('deleteAllResults').style.backgroundColor = '#ffebee';
            document.getElementById('deleteAllResults').style.borderColor = '#ffcdd2';
            document.getElementById('deleteAllResultsText').innerHTML =
                '<span style="color: #c62828;">Network error: ' + err.message + '</span>';
        });
}