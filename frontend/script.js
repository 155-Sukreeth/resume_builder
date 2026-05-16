document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize empty state
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

    // Mapping section types to their column and formatting style
    const sectionConfig = {
        experience: { column: 'right' },
        education: { column: 'right' },
        projects: { column: 'left' },
        certifications: { column: 'left' },
        achievements: { column: 'left' }
    };

    // Load Draft on startup
    fetch('/api/draft')
        .then(res => res.json())
        .then(data => {
            if (Object.keys(data).length > 0) {
                resumeData = data;
                populateForm();
                updatePreview();
            }
        })
        .catch(err => console.log('No backend found or no draft exists.', err));

    // Listen to static inputs
    document.querySelectorAll('[data-field]').forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            resumeData[field] = e.target.value;
            updatePreview();
        });
    });

    // Save draft button
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        // Collect data from dynamic sections
        collectDynamicData();
        
        fetch('/api/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        })
        .then(res => res.json())
        .then(data => alert('Draft saved successfully!'))
        .catch(err => alert('Failed to save draft. Is the backend running?'));
    });

    // Export PDF button
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        window.print();
    });

    // Function to add a list section in the UI (called via global scope onclick)
    window.addListSection = (type, title) => {
        const container = document.getElementById('dynamic-sections');
        
        // Find if group already exists
        let groupDiv = document.getElementById(`editor-group-${type}`);
        if (!groupDiv) {
            groupDiv = document.createElement('div');
            groupDiv.id = `editor-group-${type}`;
            groupDiv.className = 'form-section';
            groupDiv.innerHTML = `<h3>${title}</h3><div class="items-list"></div><button class="btn btn-secondary btn-sm mt-2" onclick="addItemToSection('${type}')">+ Add Item</button>`;
            container.appendChild(groupDiv);
        }
        
        // Add one item immediately
        window.addItemToSection(type);
    };

    // Add item to a specific section
    window.addItemToSection = (type, data = null) => {
        const listContainer = document.querySelector(`#editor-group-${type} .items-list`);
        if (!listContainer) return;

        const template = document.getElementById('list-item-template');
        const clone = template.content.cloneNode(true);
        const editorDiv = clone.querySelector('.list-item-editor');
        editorDiv.dataset.type = type;

        if (data) {
            editorDiv.querySelector('.item-title').value = data.title || '';
            editorDiv.querySelector('.item-subtitle').value = data.subtitle || '';
            editorDiv.querySelector('.item-date').value = data.date || '';
            editorDiv.querySelector('.item-location').value = data.location || '';
            editorDiv.querySelector('.item-desc').value = data.desc || '';
            editorDiv.querySelector('.item-extra').value = data.extra || '';
        }

        // Add event listeners for auto-update
        editorDiv.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                collectDynamicData();
                updatePreview();
            });
        });

        listContainer.appendChild(clone);
        if(!data) {
            collectDynamicData();
            updatePreview();
        }
    };

    // Ensure updatePreview is globally accessible for the remove button
    window.updatePreview = () => {
        // Basic Info
        document.getElementById('preview-name').textContent = resumeData.name || 'YOUR NAME';
        document.getElementById('preview-title').textContent = resumeData.title || 'Job Title';
        document.getElementById('preview-phone').textContent = resumeData.phone || '';
        document.getElementById('preview-email').textContent = resumeData.email || '';
        document.getElementById('preview-linkedin').textContent = resumeData.linkedin || '';
        document.getElementById('preview-location').textContent = resumeData.location || '';
        document.getElementById('preview-summary').textContent = resumeData.summary || '';

        // Photo
        const photoContainer = document.getElementById('preview-photo-container');
        const photoImg = document.getElementById('preview-photo');
        if (resumeData.photo) {
            photoImg.src = resumeData.photo;
            photoContainer.style.display = 'block';
        } else {
            photoContainer.style.display = 'none';
        }

        // Skills (split by comma and add bullet dots)
        const skillsContent = document.getElementById('preview-skills-content');
        skillsContent.innerHTML = '';
        if (resumeData.skills) {
            const skillArray = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);
            skillArray.forEach((skill, index) => {
                const span = document.createElement('span');
                span.textContent = skill;
                skillsContent.appendChild(span);
                if (index < skillArray.length - 1) {
                    const dot = document.createElement('span');
                    dot.textContent = ' • ';
                    dot.style.opacity = '0.5';
                    skillsContent.appendChild(dot);
                }
            });
        }

        // Hide/Show Basic sections
        document.getElementById('preview-summary-section').style.display = resumeData.summary ? 'block' : 'none';
        document.getElementById('preview-skills').style.display = resumeData.skills ? 'block' : 'none';

        // Render Dynamic Sections
        Object.keys(sectionConfig).forEach(type => {
            const config = sectionConfig[type];
            const previewSection = document.getElementById(`preview-${type}`);
            if (!previewSection) return;

            const itemsContainer = previewSection.querySelector('.items-container');
            itemsContainer.innerHTML = '';
            
            const items = resumeData.sections[type] || [];
            if (items.length === 0) {
                previewSection.style.display = 'none';
                return;
            }
            
            previewSection.style.display = 'block';

            items.forEach(item => {
                if (config.column === 'left') {
                    // Render left style
                    itemsContainer.innerHTML += `
                        <div class="left-item">
                            ${item.title ? `<div class="left-item-title">${item.title}</div>` : ''}
                            ${item.subtitle ? `<div class="left-item-subtitle">${item.subtitle}</div>` : ''}
                            ${item.date ? `<div style="font-size: 10px; margin-bottom: 3px; color: #a1cece;">${item.date}</div>` : ''}
                            ${item.desc ? `<div class="left-item-desc">${formatDesc(item.desc)}</div>` : ''}
                        </div>
                    `;
                } else {
                    // Render right style
                    itemsContainer.innerHTML += `
                        <div class="right-item">
                            <div class="right-item-header">
                                ${item.title ? `<div class="right-item-title">${item.title}</div>` : ''}
                                ${item.date ? `<div class="right-item-date">${item.date}</div>` : ''}
                            </div>
                            <div class="right-item-subheader">
                                ${item.subtitle ? `<div class="right-item-subtitle">${item.subtitle}</div>` : ''}
                                ${item.location ? `<div class="right-item-location">${item.location}</div>` : ''}
                            </div>
                            ${item.desc ? `<div class="right-item-desc">${formatDesc(item.desc)}</div>` : ''}
                            ${item.extra ? `<div class="right-item-extra">${item.extra}</div>` : ''}
                        </div>
                    `;
                }
            });
        });
    };

    function collectDynamicData() {
        // Reset dynamic data
        Object.keys(resumeData.sections).forEach(key => resumeData.sections[key] = []);

        const editors = document.querySelectorAll('.list-item-editor');
        editors.forEach(editor => {
            const type = editor.dataset.type;
            const item = {
                title: editor.querySelector('.item-title').value,
                subtitle: editor.querySelector('.item-subtitle').value,
                date: editor.querySelector('.item-date').value,
                location: editor.querySelector('.item-location').value,
                desc: editor.querySelector('.item-desc').value,
                extra: editor.querySelector('.item-extra').value
            };
            // Only add if at least title or subtitle exists
            if (item.title || item.subtitle) {
                resumeData.sections[type].push(item);
            }
        });
    }

    function populateForm() {
        // Basic fields
        document.querySelectorAll('[data-field]').forEach(input => {
            const field = input.getAttribute('data-field');
            if (resumeData[field]) {
                input.value = resumeData[field];
            }
        });

        // Dynamic sections
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
                // Initialize group
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

    // Helper to format description (convert "-" at start of lines to bullets)
    function formatDesc(text) {
        if (!text) return '';
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('-')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${trimmed.substring(1).trim()}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed) {
                    html += `<p>${trimmed}</p>`;
                }
            }
        });

        if (inList) {
            html += '</ul>';
        }
        return html;
    }

    // Initial render
    updatePreview();
});
