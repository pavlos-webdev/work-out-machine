const startBtn = document.getElementById('startBtn');
const workoutSection = document.getElementById('workoutSection');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const exerciseContainer = document.getElementById('exerciseContainer');
const finishBtn = document.getElementById('finishBtn');
const cancelBtn = document.getElementById('cancelBtn');
const timerEl = document.getElementById('timer');
const historyEl = document.getElementById('history');
const subtitle = document.getElementById('subtitle');

let timerInterval = null;
let startTime = null;

let workouts = [];

try {
  workouts = JSON.parse(localStorage.getItem('lift_workouts')) || [];
} catch (err) {
  workouts = [];
  localStorage.removeItem('lift_workouts');
}

renderHistory();

startBtn.addEventListener('click', () => {
  workoutSection.classList.remove('hidden');
  subtitle.textContent = 'Workout in progress';

  startTime = Date.now();

  clearInterval(timerInterval);

  timerInterval = setInterval(updateTimer, 1000);

  exerciseContainer.innerHTML = '';

  addExercise();
});

addExerciseBtn.addEventListener('click', addExercise);

cancelBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  workoutSection.classList.add('hidden');
  subtitle.textContent = 'Track your workouts';
});

finishBtn.addEventListener('click', () => {
  const workoutName = document.getElementById('workoutName').value || 'Workout';

  const exercises = [];

  document.querySelectorAll('.exercise').forEach(exercise => {
    const name = exercise.querySelector('.exercise-name').value || 'Exercise';

    const sets = [];

    exercise.querySelectorAll('.set-row').forEach(row => {
      const inputs = row.querySelectorAll('input');

      sets.push({
        reps: inputs[0].value || 0,
        weight: inputs[1].value || 0
      });
    });

    exercises.push({
      name,
      sets
    });
  });

  workouts.unshift({
    id: Date.now(),
    name: workoutName,
    exercises
  });

  localStorage.setItem('lift_workouts', JSON.stringify(workouts));

  clearInterval(timerInterval);

  workoutSection.classList.add('hidden');

  subtitle.textContent = 'Track your workouts';

  renderHistory();
});

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
}

function addExercise() {
  const div = document.createElement('div');

  div.className = 'exercise';

  div.innerHTML = `
    <input
      class="exercise-name"
      type="text"
      placeholder="Exercise name"
    />

    <div class="set-row">
      <input type="number" placeholder="Reps" />
      <input type="number" placeholder="Weight" />
    </div>
  `;

  exerciseContainer.appendChild(div);
}

function renderHistory() {
  if (workouts.length === 0) {
    historyEl.innerHTML = '<p>No workouts yet.</p>';
    return;
  }

  historyEl.innerHTML = workouts.map(workout => {
    const totalSets = workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.length;
    }, 0);

    return `
      <div class="history-item">
        <strong>${workout.name}</strong>
        <div>${workout.exercises.length} exercises</div>
        <div>${totalSets} sets</div>
      </div>
    `;
  }).join('');
}