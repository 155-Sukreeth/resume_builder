document.addEventListener('DOMContentLoaded', () => {
    let resumeData = {
        photo: '',
        name: '',
        title: '',
        phone: '',
        email: '',
        linkedin: '',
        location: '',
        summary: '',
        skills: '',
        sections: {
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            achievements: []
        }
    };

    let debounceTimer;

    // Load Draft on startup
    fetch('/api/draft')
        .then(res => res.json())
        .then(data => {
            if (Object.keys(data).length > 0) {
                resumeData = data;
                populateForm();
                triggerPreviewUpdate();
            }
        })
        .catch(err => console.log('No backend found or no draft exists.', err));

    // Listen to static inputs
    document.querySelectorAll('[data-field]').forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            resumeData[field] = e.target.value;
            triggerPreviewUpdate();
        });
    });

    // Save draft button
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        collectDynamicData();
        fetch('/api/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        })
        .then(res => res.json())
        .then(data => alert('Draft saved successfully!'))
        .catch(err => alert('Failed to save draft.'));
    });

    // Export PDF button (Backend driven)
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        collectDynamicData();
        
        // Show loading state
        const btn = document.getElementById('export-pdf-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Generating PDF...';
        btn.disabled = true;

        fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            // Create a link to download the PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => alert('Failed to export PDF: ' + err))
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        });
    });

    window.addListSection = (type, title) => {
        const container = document.getElementById('dynamic-sections');
        let groupDiv = document.getElementById(`editor-group-${type}`);
        if (!groupDiv) {
            groupDiv = document.createElement('div');
            groupDiv.id = `editor-group-${type}`;
            groupDiv.className = 'form-section';
            groupDiv.innerHTML = `<h3>${title}</h3><div class="items-list"></div><button class="btn btn-secondary btn-sm mt-2" onclick="addItemToSection('${type}')">+ Add Item</button>`;
            container.appendChild(groupDiv);
        }
        window.addItemToSection(type);
    };

    window.addItemToSection = (type, data = null) => {
        const listContainer = document.querySelector(`#editor-group-${type} .items-list`);
        if (!listContainer) return;

        const template = document.getElementById('list-item-template');
        const clone = template.content.cloneNode(true);
        const editorDiv = clone.querySelector('.list-item-editor');
        editorDiv.dataset.type = type;

        if (data) {
            editorDiv.querySelector('.item-icon').value = data.icon || '';
            editorDiv.querySelector('.item-title').value = data.title || '';
            editorDiv.querySelector('.item-subtitle').value = data.subtitle || '';
            editorDiv.querySelector('.item-date').value = data.date || '';
            editorDiv.querySelector('.item-location').value = data.location || '';
            editorDiv.querySelector('.item-desc').value = data.desc || '';
            editorDiv.querySelector('.item-extra').value = data.extra || '';
        }

        editorDiv.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                triggerPreviewUpdate();
            });
        });

        listContainer.appendChild(clone);
        if(!data) {
            triggerPreviewUpdate();
        }
    };

    window.triggerPreviewUpdate = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            collectDynamicData();
            
            // Send to backend to get rendered HTML
            fetch('/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            })
            .then(res => res.text())
            .then(html => {
                const iframe = document.getElementById('preview-iframe');
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(html);
                doc.close();
            })
            .catch(err => console.error("Error rendering preview:", err));

        }, 300); // Debounce to avoid spamming the backend
    };

    function collectDynamicData() {
        Object.keys(resumeData.sections).forEach(key => resumeData.sections[key] = []);
        const editors = document.querySelectorAll('.list-item-editor');
        editors.forEach(editor => {
            const type = editor.dataset.type;
            const item = {
                icon: editor.querySelector('.item-icon').value,
                title: editor.querySelector('.item-title').value,
                subtitle: editor.querySelector('.item-subtitle').value,
                date: editor.querySelector('.item-date').value,
                location: editor.querySelector('.item-location').value,
                desc: editor.querySelector('.item-desc').value,
                extra: editor.querySelector('.item-extra').value
            };
            if (item.title || item.subtitle || item.desc) {
                resumeData.sections[type].push(item);
            }
        });
    }

    function populateForm() {
        document.querySelectorAll('[data-field]').forEach(input => {
            const field = input.getAttribute('data-field');
            if (resumeData[field]) {
                input.value = resumeData[field];
            }
        });

        const titles = {
            experience: 'Experience',
            education: 'Education',
            projects: 'Project',
            certifications: 'Certification',
            achievements: 'Achievement'
        };

        Object.keys(resumeData.sections).forEach(type => {
            const items = resumeData.sections[type];
            if (items && items.length > 0) {
                const container = document.getElementById('dynamic-sections');
                let groupDiv = document.createElement('div');
                groupDiv.id = `editor-group-${type}`;
                groupDiv.className = 'form-section';
                groupDiv.innerHTML = `<h3>${titles[type] || type}</h3><div class="items-list"></div><button class="btn btn-secondary btn-sm mt-2" onclick="addItemToSection('${type}')">+ Add Item</button>`;
                container.appendChild(groupDiv);

                items.forEach(item => {
                    window.addItemToSection(type, item);
                });
            }
        });
    }
});
