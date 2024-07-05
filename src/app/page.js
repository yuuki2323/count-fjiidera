"use client"
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import Loader from './components/Loader';

export default function Home() {
  const [initialGoals, setInitialGoals] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [currentGoals, setCurrentGoals] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [todayGoals, setTodayGoals] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [decrementValues, setDecrementValues] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [editMode, setEditMode] = useState({
    newEntries: false,
    auUQPoints: false,
    serpa: false,
    saison: false,
    souhan: false,
  });
  const [editValues, setEditValues] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [editTodayGoalsMode, setEditTodayGoalsMode] = useState({
    newEntries: false,
    auUQPoints: false,
    serpa: false,
    saison: false,
    souhan: false,
  });
  const [editTodayGoalsValues, setEditTodayGoalsValues] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [userId, setUserId] = useState(null);
  const [isInitialSet, setIsInitialSet] = useState(false);
  const [history, setHistory] = useState({
    newEntries: [],
    auUQPoints: [],
    serpa: [],
    saison: [],
    souhan: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setInitialGoals(data.initialGoals);
        setCurrentGoals(data.currentGoals);
        setEditValues(data.currentGoals); // initialize edit values
        setUserId(doc.id);
        setIsInitialSet(true);
      });
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Load today's goals from localStorage
  useEffect(() => {
    const storedTodayGoals = JSON.parse(localStorage.getItem('todayGoals'));
    if (storedTodayGoals) {
      setTodayGoals(storedTodayGoals);
    }
  }, []);

  // Save today's goals to localStorage
  useEffect(() => {
    localStorage.setItem('todayGoals', JSON.stringify(todayGoals));
  }, [todayGoals]);

  // Reset today's goals at midnight
  useEffect(() => {
    const now = new Date();
    const nextDay = new Date();
    nextDay.setDate(now.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const timeout = nextDay - now;
    const timer = setTimeout(() => {
      setTodayGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
    }, timeout);

    return () => clearTimeout(timer);
  }, []);

  // Handle initial goals change
  const handleInitialGoalsChange = (event) => {
    const { name, value } = event.target;
    setInitialGoals((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle setting initial goals
  const handleSetInitialGoals = async () => {
    setCurrentGoals(initialGoals);
    const docRef = await addDoc(collection(db, 'users'), {
      initialGoals: initialGoals,
      currentGoals: initialGoals,
    });
    setUserId(docRef.id);
    setIsInitialSet(true);
  };

  // Handle decrement value change
  const handleDecrementValueChange = (event) => {
    const { name, value } = event.target;
    setDecrementValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle decrement
  const handleDecrement = async (name) => {
    const decrementValue = decrementValues[name];
    const newGoals = { ...currentGoals, [name]: currentGoals[name] > decrementValue ? currentGoals[name] - decrementValue : 0 };

    setHistory((prev) => ({
      ...prev,
      [name]: [...prev[name], currentGoals[name]], // Save current value before decrement
    }));

    setTodayGoals((prev) => ({
      ...prev,
      [name]: prev[name] + decrementValue, // Update today's goals
    }));

    setCurrentGoals(newGoals);

    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { currentGoals: newGoals });
    }
  };

  // Handle edit value change
  const handleEditValueChange = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle edit today goals value change
  const handleEditTodayGoalsValueChange = (event) => {
    const { name, value } = event.target;
    setEditTodayGoalsValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle edit confirmation
  const handleEditConfirm = async (name) => {
    const editValue = editValues[name];
    const newGoals = { ...currentGoals, [name]: editValue };

    setHistory((prev) => ({
      ...prev,
      [name]: [...prev[name], currentGoals[name]], // Save current value before edit
    }));

    setCurrentGoals(newGoals);

    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { currentGoals: newGoals });
    }
    setEditMode((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  // Handle edit today goals confirmation
  const handleEditTodayGoalsConfirm = (name) => {
    const editTodayGoalValue = editTodayGoalsValues[name];
    const newTodayGoals = { ...todayGoals, [name]: editTodayGoalValue };

    setTodayGoals(newTodayGoals);

    setEditTodayGoalsMode((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  // Handle click to edit
  const handleClickToEdit = (name) => {
    setEditMode((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Handle click to edit today goals
  const handleClickToEditTodayGoals = (name) => {
    setEditTodayGoalsMode((prev) => ({
      ...prev,
      [name]: true,
    }));
    setEditTodayGoalsValues((prev) => ({
      ...prev,
      [name]: todayGoals[name],
    }));
  };

  // Calculate percentage
  const calculatePercentage = (current, initial) => {
    if (initial === 0) return 0;
    return ((initial - current) / initial) * 100;
  };

  // Handle reset
  const handleReset = async () => {
    if (userId) {
      await deleteDoc(doc(db, 'users', userId));
      setInitialGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setCurrentGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setTodayGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setDecrementValues({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setEditValues({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setEditMode({
        newEntries: false,
        auUQPoints: false,
        serpa: false,
        saison: false,
        souhan: false,
      });
      setEditTodayGoalsMode({
        newEntries: false,
        auUQPoints: false,
        serpa: false,
        saison: false,
        souhan: false,
      });
      setUserId(null);
      setIsInitialSet(false);
    }
  };

  // Handle undo last change
  const handleUndo = (name) => {
    const lastValue = history[name].pop();
    if (lastValue !== undefined) {
      const newGoals = { ...currentGoals, [name]: lastValue };
      const newTodayGoals = { ...todayGoals, [name]: todayGoals[name] - decrementValues[name] };
      
      setCurrentGoals(newGoals);
      setTodayGoals(newTodayGoals);

      if (userId) {
        const userDoc = doc(db, 'users', userId);
        updateDoc(userDoc, { currentGoals: newGoals });
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="text-center mt-12">
      {!isInitialSet ? (
        <div>
          <h1 className="mb-6 text-xl font-bold">目標を設定してください</h1>
          {['newEntries', 'auUQPoints', 'serpa', 'saison', 'souhan'].map((goal) => (
            <div className="mb-4" key={goal}>
              <label>
                {goal === 'newEntries' && '新規'}
                {goal === 'auUQPoints' && 'au/UQポイント'}
                {goal === 'serpa' && 'セルパ'}
                {goal === 'saison' && 'セゾン'}
                {goal === 'souhan' && '総販'}
              </label>
              <input
                type="number"
                name={goal}
                value={initialGoals[goal]}
                onChange={handleInitialGoalsChange}
                className="border ml-2 rounded-sm"
              />
            </div>
          ))}
          <button onClick={handleSetInitialGoals} className="border py-2 px-4 rounded">設定</button>
        </div>
      ) : (
        <div>
          <h1 className="mb-6 text-xl font-bold">目標ポイントの残数</h1>
          {['newEntries', 'auUQPoints', 'serpa', 'saison', 'souhan'].map((goal) => (
            <div className="mb-4" key={goal}>
              <h2 className="mb-2 text-lg">
                {goal === 'newEntries' && '新規'}
                {goal === 'auUQPoints' && 'au/UQポイント'}
                {goal === 'serpa' && 'セルパ'}
                {goal === 'saison' && 'セゾン'}
                {goal === 'souhan' && '総販'}
                :
                {editMode[goal] ? (
                  <span>
                    <input
                      type="number"
                      name={goal}
                      value={editValues[goal]}
                      onChange={handleEditValueChange}
                      className="border ml-2 rounded-sm"
                    />
                    <button onClick={() => handleEditConfirm(goal)} className="ml-2 border py-1 px-2 rounded">修正</button>
                  </span>
                ) : (
                  <span onClick={() => handleClickToEdit(goal)} className="ml-2 cursor-pointer">
                    {currentGoals[goal]} / {initialGoals[goal]}
                  </span>
                )}
                <span className="ml-2">（{calculatePercentage(currentGoals[goal], initialGoals[goal]).toFixed(2)}%）</span>
              </h2>
              <div className="flex justify-center items-center mb-2">
                <select
                  name={goal}
                  onChange={handleDecrementValueChange}
                  value={decrementValues[goal]}
                  className="border rounded-sm"
                >
                  {[...Array(21).keys()].map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                <button onClick={() => handleDecrement(goal)} className="ml-2 border py-1 px-2 rounded">確定</button>
                <button onClick={() => handleUndo(goal)} className="ml-2 border py-1 px-2 rounded">元に戻す</button>
              </div>
              <div>
                <span className="font-bold">本日獲得:</span>
                {editTodayGoalsMode[goal] ? (
                  <span>
                    <input
                      type="number"
                      name={goal}
                      value={editTodayGoalsValues[goal]}
                      onChange={handleEditTodayGoalsValueChange}
                      className="border ml-2 rounded-sm"
                    />
                    <button onClick={() => handleEditTodayGoalsConfirm(goal)} className="ml-2 border py-1 px-2 rounded">修正</button>
                  </span>
                ) : (
                  <span onClick={() => handleClickToEditTodayGoals(goal)} className="ml-2 cursor-pointer">
                    {todayGoals[goal]}
                  </span>
                )}
              </div>
            </div>
          ))}
          <button onClick={handleReset} className="border rounded py-1 px-2">リセット</button>
        </div>
      )}
    </div>
  );
}
