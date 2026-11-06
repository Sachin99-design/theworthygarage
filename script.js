// THE WORTHY GARAGE — main.js
document.addEventListener('DOMContentLoaded', function () {

  // Mobile hamburger menu
  var hamburger = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if (hamburger && nav) {
    var serviceButton = document.querySelector('.desktop-cta');
    var serviceButtonPlaceholder = document.createComment('service-button-placeholder');
    var serviceButtonOriginalParent = serviceButton ? serviceButton.parentNode : null;
    var serviceButtonNextSibling = serviceButton ? serviceButton.nextSibling : null;

    function moveServiceButtonToNav() {
      if (!serviceButton || !nav.classList.contains('open')) return;
      if (!serviceButton.classList.contains('mobile-in-nav')) {
        serviceButton.classList.add('mobile-in-nav');
        var navList = nav.querySelector('ul');
        navList.appendChild(serviceButton);
      }
    }
    function moveServiceButtonToHeader() {
      if (!serviceButton || !serviceButton.classList.contains('mobile-in-nav')) return;
      serviceButton.classList.remove('mobile-in-nav');
      if (serviceButtonOriginalParent) {
        serviceButtonOriginalParent.insertBefore(serviceButton, serviceButtonNextSibling);
      }
    }
    function syncServiceButtonPosition() {
      if (window.innerWidth <= 960 && nav.classList.contains('open')) {
        moveServiceButtonToNav();
      } else {
        moveServiceButtonToHeader();
      }
    }

    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
      syncServiceButtonPosition();
    });

    window.addEventListener('resize', function () {
      syncServiceButtonPosition();
    });
  }

  // Generic conditional fields toggler
  document.querySelectorAll('[data-conditional-trigger]').forEach(function (trigger) {
    var group = trigger.getAttribute('data-conditional-trigger');

    function update() {
      var value = trigger.value;
      document.querySelectorAll('[data-conditional-group="' + group + '"]').forEach(function (block) {
        if (block.getAttribute('data-conditional-value') === value) {
          block.classList.add('active');
        } else {
          block.classList.remove('active');
        }
      });
    }
    trigger.addEventListener('change', update);
    update();
  });

  document.querySelectorAll('select[name="registered_owner"]').forEach(function (trigger) {
    function updateRegisteredOwner() {
      document.querySelectorAll('[data-conditional-group="registered_owner"]').forEach(function (block) {
        block.classList.toggle('active', trigger.value === 'No');
      });
    }
    trigger.addEventListener('change', updateRegisteredOwner);
    updateRegisteredOwner();
  });

  // Dropdown toggle for Services and similar menus
  document.querySelectorAll('.dropdown .dropdown-toggle, .dropdown .dropdown-label').forEach(function (toggle) {
    var container = toggle.closest('.dropdown');
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var isOpen = container.classList.toggle('open');
      container.classList.toggle('dropdown-closed', !isOpen);
      container.querySelectorAll('.dropdown-toggle, .dropdown-label').forEach(function (btn) {
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
    container.addEventListener('mouseleave', function () {
      container.classList.remove('dropdown-closed');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown.open').forEach(function (openDropdown) {
      openDropdown.classList.remove('open');
      openDropdown.classList.remove('dropdown-closed');
      openDropdown.querySelectorAll('.dropdown-toggle, .dropdown-label').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.dropdown.open').forEach(function (openDropdown) {
      openDropdown.classList.remove('open');
      openDropdown.classList.remove('dropdown-closed');
      openDropdown.querySelectorAll('.dropdown-toggle, .dropdown-label').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Existing generic max-size check for other file inputs
  document.querySelectorAll('input[type=file][data-max-mb]').forEach(function (input) {
    input.addEventListener('change', function () {
      var maxBytes = parseFloat(input.getAttribute('data-max-mb')) * 1024 * 1024;
      var msgEl = input.parentElement.querySelector('.file-msg');
      var tooBig = Array.from(input.files).some(function (f) { return f.size > maxBytes; });
      if (msgEl) {
        msgEl.textContent = tooBig ? 'One or more files exceed the allowed size and will be rejected.' : '';
      }
    });
  });

  // Copy Reference ID buttons
  document.querySelectorAll('[data-copy-ref]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy-ref');
      navigator.clipboard.writeText(text).then(function () {
        var old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = old; }, 1500);
      });
    });
  });

  // Inline YouTube player for the videos page
  var videoPlayerBox = document.getElementById('video-player-box');
  var videoPlayerTitle = document.getElementById('video-player-title');
  var videoPlayerFrame = document.getElementById('video-player-frame');
  var videoPlayerClose = document.getElementById('video-player-close');

  if (videoPlayerBox && videoPlayerFrame) {
    function closeVideoPlayer() {
      videoPlayerBox.classList.add('hidden');
      videoPlayerFrame.innerHTML = '<p class="video-player-placeholder">Click any thumbnail below to play the video here.</p>';
    }

    document.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function (event) {
        if (event.target.closest('.watch-youtube-link')) return;
        var embedUrl = card.getAttribute('data-embed-url');
        var title = card.getAttribute('data-title');
        if (!embedUrl) return;
        videoPlayerTitle.textContent = title;
        videoPlayerFrame.innerHTML = '<iframe src="' + embedUrl + '" title="' + title + '" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>';
        videoPlayerBox.classList.remove('hidden');
      });
      card.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });

    if (videoPlayerClose) {
      videoPlayerClose.addEventListener('click', closeVideoPlayer);
    }
  }

  // Move focus to error summary after failed submission
  var errorSummary = document.querySelector('.error-summary');
  if (errorSummary) {
    errorSummary.setAttribute('tabindex', '-1');
    errorSummary.focus();
  }

  // ==========================================================
  // VEHICLE STORY FORM — Google Apps Script + Google Drive
  // ==========================================================
  var storyForm = document.getElementById('vehicle-story-form');
  if (!storyForm) return;

  // Keep your deployed Google Apps Script /exec URL here.
  var GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZ6jUmuX6l4wYMOEgm9FnycB74FGS0Tb8Av5oG-BgJ9SweqjyUbtAqZgPgS8lgS_6oVA/exec';

  var submitButton = document.getElementById('submit-button');
  var formMessage = document.getElementById('form-message');
  var pdfInput = document.getElementById('storyPdf');
  var pdfFileName = document.getElementById('pdfFileName');
  var confirmModal = document.getElementById('twg-confirm-modal');
  var confirmOk = document.getElementById('twg-confirm-ok');
  var MAX_PDF_BYTES = 5 * 1024 * 1024;
  var REQUEST_TIMEOUT_MS = 120000;
  var submissionInProgress = false;
  var lastFocusedElement = null;

  function showFormMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.style.color = type === 'error' ? '#B8151A' : '#6B7280';
    formMessage.style.fontWeight = type === 'error' ? '600' : '400';
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.classList.toggle('is-submitting', isSubmitting);
    submitButton.textContent = isSubmitting ? 'Submitting...' : 'Submit Your Story';
    submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  }

  function openConfirmationModal() {
    if (!confirmModal) {
      window.alert('Your request has been sent to TWG family. Our team will contact you shortly.');
      return;
    }

    lastFocusedElement = document.activeElement;
    confirmModal.classList.add('is-visible');
    confirmModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('twg-modal-open');
    if (confirmOk) confirmOk.focus();
  }

  function closeConfirmationModal() {
    if (!confirmModal) return;
    confirmModal.classList.remove('is-visible');
    confirmModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('twg-modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  if (confirmOk) {
    confirmOk.addEventListener('click', closeConfirmationModal);
  }

  if (confirmModal) {
    confirmModal.addEventListener('click', function (event) {
      if (event.target && event.target.hasAttribute('data-modal-close')) {
        closeConfirmationModal();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && confirmModal && confirmModal.classList.contains('is-visible')) {
      closeConfirmationModal();
    }
  });

  function makeRequestToken() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'twg-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || '');
        var commaIndex = result.indexOf(',');
        if (commaIndex === -1) {
          reject(new Error('Could not read the selected PDF.'));
          return;
        }
        resolve(result.slice(commaIndex + 1));
      };
      reader.onerror = function () {
        reject(new Error('Unable to read the selected PDF. Please choose it again.'));
      };
      reader.readAsDataURL(file);
    });
  }

  function validatePdf(file) {
    if (!file) return null;
    var nameLooksPdf = /\.pdf$/i.test(file.name);
    var typeLooksPdf = file.type === 'application/pdf' || file.type === '';
    if (!nameLooksPdf || !typeLooksPdf) {
      return 'Please select a valid PDF file only.';
    }
    if (file.size === 0) return 'The selected PDF is empty. Please choose another file.';
    if (file.size > MAX_PDF_BYTES) return 'PDF size must not exceed 5 MB.';
    return null;
  }

  if (pdfInput) {
    pdfInput.addEventListener('change', function () {
      if (submissionInProgress) return;
      var file = pdfInput.files && pdfInput.files[0];
      var error = validatePdf(file);
      if (error) {
        pdfInput.value = '';
        if (pdfFileName) {
          pdfFileName.textContent = 'No file selected';
          pdfFileName.classList.remove('has-file');
        }
        showFormMessage(error, 'error');
        return;
      }
      if (pdfFileName) {
        pdfFileName.textContent = file ? file.name : 'No file selected';
        pdfFileName.classList.toggle('has-file', !!file);
      }
      showFormMessage('', 'info');
    });
  }

  function postToAppsScript(payload) {
    return new Promise(function (resolve, reject) {
      if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.indexOf('/exec') === -1 ||
          GOOGLE_APPS_SCRIPT_URL.indexOf('PASTE_YOUR_') !== -1) {
        reject(new Error('Google Apps Script URL is not configured. Add your deployed /exec URL in script.js.'));
        return;
      }

      var token = payload.requestToken;
      var iframeName = 'twg_submit_frame_' + token.replace(/[^a-zA-Z0-9_]/g, '');
      var iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.title = 'Form submission response';
      iframe.style.display = 'none';

      var transportForm = document.createElement('form');
      transportForm.method = 'POST';
      transportForm.action = GOOGLE_APPS_SCRIPT_URL;
      transportForm.target = iframeName;
      transportForm.acceptCharset = 'UTF-8';
      transportForm.enctype = 'application/x-www-form-urlencoded';
      transportForm.style.display = 'none';

      Object.keys(payload).forEach(function (key) {
        var field = document.createElement('input');
        field.type = 'hidden';
        field.name = key;
        field.value = payload[key] == null ? '' : String(payload[key]);
        transportForm.appendChild(field);
      });

      var finished = false;
      var timeoutId;

      function cleanup() {
        window.removeEventListener('message', onMessage);
        if (timeoutId) window.clearTimeout(timeoutId);
        transportForm.remove();
        iframe.remove();
      }

      function onMessage(event) {
        var data = event.data;
        if (!data || data.type !== 'TWG_VEHICLE_STORY_RESULT' || data.requestToken !== token) return;
        if (finished) return;
        finished = true;
        cleanup();
        if (data.success) {
          resolve(data);
        } else {
          reject(new Error(data.message || 'Your submission could not be saved. Please try again.'));
        }
      }

      window.addEventListener('message', onMessage);
      document.body.appendChild(iframe);
      document.body.appendChild(transportForm);

      timeoutId = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error('The server did not confirm the submission in time. Please check your connection and try again.'));
      }, REQUEST_TIMEOUT_MS);

      try {
        transportForm.submit();
      } catch (error) {
        if (!finished) {
          finished = true;
          cleanup();
          reject(new Error('Could not send the form. Please try again.'));
        }
      }
    });
  }

  storyForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // This guard is set synchronously, before file reading or network activity,
    // so rapid repeated clicks cannot start multiple requests from this page.
    if (submissionInProgress) return;
    if (!storyForm.reportValidity()) return;

    var selectedPdf = pdfInput && pdfInput.files ? pdfInput.files[0] : null;
    var pdfError = validatePdf(selectedPdf);
    if (pdfError) {
      showFormMessage(pdfError, 'error');
      if (pdfInput) pdfInput.focus();
      return;
    }

    submissionInProgress = true;
    setSubmitting(true);
    showFormMessage('Submitting your vehicle story securely. Please wait...', 'info');

    var formData = new FormData(storyForm);
    var payload = {
      requestToken: makeRequestToken(),
      name: String(formData.get('name') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      state: String(formData.get('state') || '').trim(),
      vehicle: String(formData.get('vehicle') || '').trim(),
      story: String(formData.get('story') || '').trim(),
      whatsapp: String(formData.get('whatsapp') || '').trim(),
      consent: formData.get('consent') === 'Yes' ? 'Yes' : 'No',
      website: ''
    };

    try {
      if (selectedPdf) {
        payload.pdfName = selectedPdf.name;
        payload.pdfMimeType = selectedPdf.type || 'application/pdf';
        payload.pdfBase64 = await fileToBase64(selectedPdf);
      } else {
        payload.pdfName = '';
        payload.pdfMimeType = '';
        payload.pdfBase64 = '';
      }

      await postToAppsScript(payload);

      storyForm.reset();
      if (pdfFileName) {
        pdfFileName.textContent = 'No file selected';
        pdfFileName.classList.remove('has-file');
      }
      showFormMessage('', 'info');
      openConfirmationModal();
    } catch (error) {
      showFormMessage(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submissionInProgress = false;
      setSubmitting(false);
    }
  });
});
