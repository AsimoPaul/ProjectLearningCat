let editor;
let activeTabId;

function executeCode() {
  fetch('/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: editor.getValue() }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('output').textContent = data.output;
    });
}

function saveCode() {
  const code = editor.getValue();
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'code.py';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  saveAllTabs()
}

function deleteTab(tabId) {
    const tabWrapper = document.getElementById(`tab-wrapper-${tabId}`);
    document.getElementById('tab-container').removeChild(tabWrapper);
    localStorage.removeItem(`tab-${tabId}`);
  }  

  document.addEventListener('DOMContentLoaded', () => {
    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      mode: 'python',
      lineNumbers: true,
      theme: 'dracula',
      indentUnit: 4, // pour un retrait de 4 espaces
      smartIndent: true, // pour l'indentation automatique
      autofocus: true, // pour mettre le focus sur l'éditeur à l'ouverture de la page
      matchBrackets: true, // pour la coloration des parenthèses correspondantes
      autoCloseBrackets: true, // pour la fermeture automatique des parenthèses
      styleActiveLine: true, // pour la mise en surbrillance de la ligne active
      extraKeys: {
        "Ctrl-Space": "autocomplete" // pour activer l'autocomplétion
      },
      lineWrapping: true, 
      tabSize: 4
    });    
    createTab(true);
    document.getElementById('createButton').addEventListener('click', () => createTab(false));
    document.getElementById('saveButton').addEventListener('click', saveCode);

    setInterval(saveAllTabs, 10000);
  });
  
  function setActiveTab(tabId) {
    if (activeTabId) {
      localStorage.setItem(`tab-${activeTabId}`, editor.getValue());
    }
  
    activeTabId = tabId;
    editor.setValue(localStorage.getItem(`tab-${tabId}`));
  
    const tabWrappers = document.querySelectorAll('#tab-container > div');
    tabWrappers.forEach((wrapper) => {
      const button = wrapper.querySelector('button');
      button.classList.remove('active');
      const deleteButton = wrapper.querySelector('button:nth-child(2)');
      if (deleteButton) {
        deleteButton.classList.remove('active');
      }
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');
    const deleteButton = document.getElementById(`delete-${tabId}`);
    if (deleteButton) {
      deleteButton.classList.add('active');
    }
  
    const tabName = document.getElementById(`tab-${tabId}`).textContent;
    document.getElementById('saveButton').download = tabName;
  }
  
  function createTab(isDefault = false) {
    const tabWrappers = document.querySelectorAll('#tab-container > div');
    if (tabWrappers.length >= 8) {
      alert('Vous avez atteint la limite de 8 onglets ouverts.');
      return;
    }
  
    const tabId = new Date().getTime();
    const tabWrapper = document.createElement('div');
    tabWrapper.id = `tab-wrapper-${tabId}`;
  
    const tabButton = document.createElement('button');
    const tabIndex = tabWrappers.length;
    const tabName = isDefault
      ? 'main.py'
      : tabIndex < 7
      ? `main${tabIndex}.py`
      : 'end.py';
    tabButton.textContent = tabName;
    tabButton.id = `tab-${tabId}`;
    tabButton.addEventListener('click', () => {
      setActiveTab(tabId);
    });
  
    tabWrapper.appendChild(tabButton);
  
    if (!isDefault) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.id = `delete-${tabId}`;
      deleteButton.addEventListener('click', () => {
        deleteTab(tabId);
      });
      tabWrapper.appendChild(deleteButton);
    }
  
    document.getElementById('tab-container').appendChild(tabWrapper);
    localStorage.setItem(`tab-${tabId}`, '');
    setActiveTab(tabId);
  }
  
  function saveAllTabs() {
    const tabWrappers = document.querySelectorAll('#tab-container > div');
    tabWrappers.forEach((wrapper) => {
      const tabId = parseInt(wrapper.id.split('-')[2]);
      if (tabId === activeTabId) {
        localStorage.setItem(`tab-${activeTabId}`, editor.getValue());
      }
    });
  }