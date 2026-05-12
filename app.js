const EXERCISES = [
  {name:'Bench Press', muscles:'Chest · Triceps'},
  {name:'Incline Bench Press', muscles:'Upper Chest'},
  {name:'Dumbbell Fly', muscles:'Chest'},
  {name:'Push-up', muscles:'Chest · Triceps'},
  {name:'Cable Crossover', muscles:'Chest'},
  {name:'Overhead Press', muscles:'Shoulders · Triceps'},
  {name:'Lateral Raise', muscles:'Shoulders'},
  {name:'Front Raise', muscles:'Shoulders'},
  {name:'Arnold Press', muscles:'Shoulders'},
  {name:'Tricep Pushdown', muscles:'Triceps'},
  {name:'Skull Crusher', muscles:'Triceps'},
  {name:'Tricep Dip', muscles:'Triceps'},
  {name:'Pull-up', muscles:'Back · Biceps'},
  {name:'Barbell Row', muscles:'Back'},
  {name:'Dumbbell Row', muscles:'Back'},
  {name:'Lat Pulldown', muscles:'Back'},
  {name:'Seated Cable Row', muscles:'Back'},
  {name:'Face Pull', muscles:'Rear Delts'},
  {name:'Barbell Curl', muscles:'Biceps'},
  {name:'Dumbbell Curl', muscles:'Biceps'},
  {name:'Hammer Curl', muscles:'Biceps'},
  {name:'Preacher Curl', muscles:'Biceps'},
  {name:'Squat', muscles:'Quads · Glutes'},
  {name:'Leg Press', muscles:'Quads'},
  {name:'Romanian Deadlift', muscles:'Hamstrings · Glutes'},
  {name:'Deadlift', muscles:'Full Body'},
  {name:'Leg Curl', muscles:'Hamstrings'},
  {name:'Leg Extension', muscles:'Quads'},
  {name:'Hip Thrust', muscles:'Glutes'},
  {name:'Calf Raise', muscles:'Calves'},
  {name:'Lunge', muscles:'Quads · Glutes'},
  {name:'Plank', muscles:'Core'},
  {name:'Crunch', muscles:'Core'},
  {name:'Cable Crunch', muscles:'Core'},
  {name:'Russian Twist', muscles:'Core'},
  {name:'Custom Exercise', muscles:'Custom'},
];
 
const TEMPLATES = {
  'Push Day': ['Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Tricep Pushdown'],
  'Pull Day': ['Pull-up','Barbell Row','Lat Pulldown','Barbell Curl','Face Pull'],
  'Leg Day': ['Squat','Romanian Deadlift','Leg Press','Leg Curl','Calf Raise'],
};
 
let savedTemplates = JSON.parse(
  localStorage.getItem('lift_templates') || '{}'
);

let workouts = JSON.parse(localStorage.getItem('lift_workouts') || '[]');
let currentWorkout = null;
let timerInterval = null;
let timerStart = null;
let currentExerciseTarget = null;
 
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const tabs = [
  'log',
  'templates',
  'history',
  'stats'
  
];
  document.querySelectorAll('.tab-btn')[tabs.indexOf(tab)].classList.add('active');
  document.getElementById('screen-' + tab).classList.add('active');
  if (tab === 'history') renderHistory();
  if (tab === 'stats') renderStats();

  if (tab === 'templates')
  renderSavedTemplates();
}
 
function startWorkout(name) {
  currentWorkout = {
    name: name || 'Morning Workout',
    date: new Date().toISOString(),
    exercises: []
  };
  document.getElementById('workout-name').value = currentWorkout.name;
  document.getElementById('log-idle').style.display = 'none';
  document.getElementById('log-active').style.display = 'block';
  document.getElementById('exercises-container').innerHTML = '';
  timerStart = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('nav-sub').textContent = 'Workout in progress';
  addExercise();
}
 
function startFromTemplate(tplName) {
  currentWorkout = {
    name: tplName,
    date: new Date().toISOString(),
    exercises: []
  };
  document.getElementById('workout-name').value = tplName;
  document.getElementById('log-idle').style.display = 'none';
  document.getElementById('log-active').style.display = 'block';
  document.getElementById('exercises-container').innerHTML = '';
  timerStart = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('nav-sub').textContent = 'Workout in progress';
  const exs = TEMPLATES[tplName] || [];
  exs.forEach(name => addExercise(name));
}

function startSavedTemplate(templateName) {

  const template =
    savedTemplates[templateName];

  if (!template) return;

  currentWorkout = {
    name: templateName,
    date: new Date().toISOString(),
    exercises: []
  };

  document.getElementById('workout-name').value =
    templateName;

  document.getElementById('log-idle').style.display =
    'none';

  document.getElementById('log-active').style.display =
    'block';

  document.getElementById('exercises-container').innerHTML =
    '';

  timerStart = Date.now();

  timerInterval =
    setInterval(updateTimer, 1000);

  document.getElementById('nav-sub').textContent =
    'Workout in progress';

  template.forEach(exercise => {

    addExercise(exercise.name);

    const blocks =
      document.querySelectorAll('.exercise-block');

    const newest =
      blocks[blocks.length - 1];

    const exId = newest.id;

    const setsContainer =
      document.getElementById(exId + '-sets');

    setsContainer.innerHTML = '';

    setCounters[exId] = 0;

    exercise.sets.forEach(set => {

      addSet(exId);

      const rows =
        setsContainer.querySelectorAll('.set-row');

      const newestRow =
        rows[rows.length - 1];

      newestRow.querySelector(
        `input[id$="-reps"]`
      ).value = set.reps;

      newestRow.querySelector(
        `input[id$="-weight"]`
      ).value = set.weight;

      newestRow.querySelector('select').value =
        set.unit || 'lbs';
    });
  });
}
 
function updateTimer() {
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  document.getElementById('timer-display').textContent = m + ':' + String(s).padStart(2,'0');
}
 
let exCounter = 0;
function addExercise(namePreset) {
  const id = 'ex-' + (exCounter++);
  const container = document.getElementById('exercises-container');
  const div = document.createElement('div');
  div.className = 'exercise-block';
  div.id = id;
  div.innerHTML = `
    <div class="exercise-header">
      <input type="text" class="exercise-name-input" placeholder="Exercise name" value="${namePreset || ''}" id="${id}-name">
      <button class="btn-secondary" onclick="openExercisePicker('${id}')">Browse</button>
      <button class="btn-danger" onclick="removeExercise('${id}')">✕</button>
    </div>
    <div class="sets-table">
      <div class="sets-header">
        <span>Set</span>
        <span>Reps</span>
        <span>Weight</span>
        <span>Unit</span>
        <span></span>
      </div>
      <div id="${id}-sets"></div>
    </div>
    <div class="add-set-row">
      <button class="add-set-btn" onclick="addSet('${id}')">+ Add Set</button>
    </div>
  `;
  container.appendChild(div);
  addSet(id);
}
 
function removeExercise(id) {
  document.getElementById(id).remove();
}
 
let setCounters = {};
function addSet(exId) {
  if (!setCounters[exId]) setCounters[exId] = 0;
  setCounters[exId]++;
  const num = setCounters[exId];
  const setId = exId + '-set-' + num;
  const container = document.getElementById(exId + '-sets');
  const div = document.createElement('div');
  div.className = 'set-row';
  div.id = setId;
  div.innerHTML = `
    <div class="set-number">${num}</div>
    <input type="number" placeholder="—" min="0" id="${setId}-reps">
    <input type="number" placeholder="—" min="0" step="0.5" id="${setId}-weight">
    <select id="${setId}-unit" style="padding: 7px 28px 7px 8px; font-size: 13px;">
      <option>lbs</option>
      <option>kg</option>
    </select>
    <button class="remove-set-btn" onclick="removeSet('${setId}', '${exId}')">−</button>
  `;
  container.appendChild(div);
}
 
function removeSet(setId, exId) {
  const el = document.getElementById(setId);
  if (el) el.remove();
  renumberSets(exId);
}
 
function renumberSets(exId) {
  const rows = document.querySelectorAll(`#${exId}-sets .set-row`);
  rows.forEach((row, i) => {
    const badge = row.querySelector('.set-number');
    if (badge) badge.textContent = i + 1;
  });
}
 
function openExercisePicker(exId) {
  currentExerciseTarget = exId;
  const searchInput = document.getElementById('exercise-search');
  searchInput.value = '';
  filterExercises();
  document.getElementById('exercise-modal').classList.add('open');
  searchInput.focus();
}
 
function closeModal(e) {
  document.getElementById('exercise-modal').classList.remove('open');
}
 
function filterExercises() {
  const q = document.getElementById('exercise-search').value.toLowerCase();
  const list = document.getElementById('exercise-list');
  const filtered = EXERCISES.filter(e => e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q));
  list.innerHTML = filtered.map(e => `
    <div onclick="pickExercise('${e.name}')" style="padding: 12px 4px; display: flex; align-items: center; justify-content: space-between; border-bottom: 0.5px solid var(--separator); cursor: pointer;">
      <div>
        <div style="font-size: 16px; font-weight: 500;">${e.name}</div>
        <div style="font-size: 12px; color: var(--text3); margin-top: 2px;">${e.muscles}</div>
      </div>
      <span style="color: var(--ios-blue); font-size: 20px;">+</span>
    </div>
  `).join('');
}
 
function pickExercise(name) {
  if (currentExerciseTarget) {
    document.getElementById(currentExerciseTarget + '-name').value = name === 'Custom Exercise' ? '' : name;
    if (name === 'Custom Exercise') {
      document.getElementById(currentExerciseTarget + '-name').focus();
    }
  }
  document.getElementById('exercise-modal').classList.remove('open');
}
 
function collectWorkoutData() {
  const name = document.getElementById('workout-name').value || 'Workout';
  const exercises = [];
  document.querySelectorAll('.exercise-block').forEach(block => {
    const exName = block.querySelector('.exercise-name-input').value || 'Unknown Exercise';
    const sets = [];
    block.querySelectorAll('.set-row').forEach(row => {
      const reps = row.querySelector('input[id$="-reps"]')?.value;
      const weight = row.querySelector('input[id$="-weight"]')?.value;
      const unit = row.querySelector('select')?.value || 'lbs';
      sets.push({ reps: reps || '—', weight: weight || '—', unit });
    });
    if (sets.length > 0) exercises.push({ name: exName, sets });
  });
  return { name, exercises };
}

function saveCurrentAsTemplate() {

  const { name, exercises } =
    collectWorkoutData();

  if (exercises.length === 0) {
    alert('Add exercises first.');
    return;
  }

  const templateName =
    prompt(
      'Template name:',
      name
    );

  if (!templateName) return;

  savedTemplates[templateName] =
    exercises;

  localStorage.setItem(
    'lift_templates',
    JSON.stringify(savedTemplates)
  );

  renderSavedTemplates();

  alert('Workout template saved.');
}
 
function finishWorkout() {
  const { name, exercises } = collectWorkoutData();
  if (exercises.length === 0) {
    alert('Add at least one exercise before finishing.');
    return;
  }
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  const workout = {
    id: Date.now(),
    name,
    date: new Date().toISOString(),
    duration: elapsed,
    exercises
  };
  workouts.unshift(workout);
  localStorage.setItem('lift_workouts', JSON.stringify(workouts));
  endSession();
  switchTab('history');
}
 
function cancelWorkout() {
  if (!confirm('Cancel this workout? Progress will be lost.')) return;
  endSession();
}
 
function endSession() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerStart = null;
  currentWorkout = null;
  setCounters = {};
  exCounter = 0;
  document.getElementById('log-idle').style.display = 'block';
  document.getElementById('log-active').style.display = 'none';
  document.getElementById('nav-sub').textContent = 'Track your training';
}
 
function renderHistory() {
  const container = document.getElementById('history-list');
  if (workouts.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">No workouts yet</div><div class="empty-sub">Your completed workouts will appear here. Start your first session!</div></div>`;
    return;
  }
  container.innerHTML = workouts.map((w, i) => {
    const date = new Date(w.date);
    const dateStr = date.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
    const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
    const totalVol = w.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => {
      const wt = parseFloat(s.weight) || 0;
      const rp = parseFloat(s.reps) || 0;
      return b + wt * rp;
    }, 0), 0);
    const dur = w.duration ? Math.floor(w.duration / 60) + 'm' : '';
    return `
      <div class="history-card" onclick="toggleHistory(${i})">
        <div class="history-date">${dateStr}</div>
        <div class="history-name">${w.name}</div>
        <div class="history-meta">
          <span class="history-pill">💪 ${w.exercises.length} exercises</span>
          <span class="history-pill">📋 ${totalSets} sets</span>
          ${dur ? `<span class="history-pill">⏱ ${dur}</span>` : ''}
          ${totalVol > 0 ? `<span class="history-pill">🏋️ ${Math.round(totalVol).toLocaleString()} lbs</span>` : ''}
        </div>
        <div class="history-detail" id="hist-detail-${i}">
          ${w.exercises.map(e => `
            <div class="history-exercise">
              <div class="history-ex-name">${e.name}</div>
              <div class="history-sets">
                ${e.sets.map((s, si) => `<span class="history-set-chip">Set ${si+1}: ${s.reps} reps × ${s.weight} ${s.unit}</span>`).join('')}
              </div>
            </div>
          `).join('')}
          <button onclick="deleteWorkout(event, ${w.id})" style="margin-top:10px; background: rgba(255,59,48,0.1); color: var(--ios-red); border: none; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;">Delete Workout</button>
        </div>
      </div>`;
  }).join('');
}
 
function renderSavedTemplates() {

  const container =
    document.getElementById('saved-templates');

  if (!container) return;

  const names =
    Object.keys(savedTemplates);

  if (names.length === 0) {

    container.innerHTML = `
      <div class="template-empty">
        <div class="template-empty-icon">💾</div>
        <div class="template-empty-title">No saved templates yet</div>
        <div class="template-empty-sub">Save a completed workout to reuse it here.</div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    names.map(name => {
      const template = savedTemplates[name] || [];
      const exercises = template.map(ex => `<span class="template-chip">${ex.name}</span>`).join('');
      return `
        <div class="template-card">
          <div class="template-top">
            <div class="template-name">${name}</div>
            <div class="template-badge">Saved</div>
          </div>
          <div class="template-exercises">
            ${exercises}
          </div>
          <div class="template-actions">
            <button class="btn-secondary" onclick="startSavedTemplate('${name}')">Start</button>
            <button class="btn-danger" onclick="deleteTemplate('${name}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
}

function toggleHistory(i) {
  const el = document.getElementById('hist-detail-' + i);
  el.classList.toggle('open');
}
 
function deleteWorkout(e, id) {
  e.stopPropagation();
  workouts = workouts.filter(w => w.id !== id);
  localStorage.setItem('lift_workouts', JSON.stringify(workouts));
  renderHistory();
  renderStats();
}
 
function deleteTemplate(name) {

  if (
    !confirm(
      `Delete template "${name}"?`
    )
  ) return;

  delete savedTemplates[name];

  localStorage.setItem(
    'lift_templates',
    JSON.stringify(savedTemplates)
  );

  renderSavedTemplates();
}

function renderStats() {
  document.getElementById('stat-total').textContent = workouts.length;
  const totalSets = workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0);
  const totalVol = workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => {
    const wt = parseFloat(s.weight) || 0;
    const rp = parseFloat(s.reps) || 0;
    return c + wt * rp;
  }, 0), 0), 0);
  document.getElementById('stat-sets').textContent = totalSets;
  document.getElementById('stat-volume').textContent = Math.round(totalVol).toLocaleString();
 
  // Streak
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const sortedDates = workouts.map(w => { const d = new Date(w.date); d.setHours(0,0,0,0); return d.getTime(); });
  const uniqueDates = [...new Set(sortedDates)].sort((a,b) => b - a);
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today); expected.setDate(today.getDate() - i);
    if (uniqueDates[i] === expected.getTime()) streak++;
    else break;
  }
  document.getElementById('stat-streak').textContent = streak;
 
  // Exercise frequency
  const freq = {};
  workouts.forEach(w => w.exercises.forEach(e => { freq[e.name] = (freq[e.name] || 0) + 1; }));
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const freqEl = document.getElementById('exercise-freq');
  if (sorted.length === 0) {
    freqEl.innerHTML = '<div style="color: var(--text3); font-size: 14px; text-align: center; padding: 16px 0;">Complete workouts to see your most-trained exercises.</div>';
  } else {
    const max = sorted[0][1];
    freqEl.innerHTML = sorted.map(([name, count]) => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 14px; font-weight: 500;">${name}</span>
          <span style="font-size: 13px; color: var(--text3);">${count}×</span>
        </div>
        <div style="background: var(--bg); border-radius: 4px; height: 6px; overflow: hidden;">
          <div style="width: ${Math.round(count/max*100)}%; height: 100%; background: var(--ios-blue); border-radius: 4px; transition: width 0.5s;"></div>
        </div>
      </div>
    `).join('');
  }
}
 
renderSavedTemplates();
renderStats();