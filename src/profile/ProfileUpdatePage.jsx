import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate(); 
  const [form, setForm] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    description: user?.description || ''
  });
  const [initialForm, setInitialForm] = useState(form);

  const [passwords, setPasswords] = useState({ old: '', new: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      const data = {
        username: user.username || '',
        fullName: user.full_name || '',
        description: user.description || ''
      };
      setForm(data);
      setInitialForm(data);
    }
  }, [user]);

  const handleProfileSave = async () => {
    const diff = {};
    if (form.username !== initialForm.username) diff.username = form.username;
    if (form.fullName !== initialForm.full_name) diff.fullName = form.full_name;
    if (form.description !== initialForm.description) diff.description = form.description;

    if (!Object.keys(diff).length) {
      toast('Вы ничего не изменили', { icon: 'ℹ️' });
      return;
    }

    try {
      await authService.updateProfile(diff);
      const updated = await authService.getProfile();
      setUser(updated);
      setInitialForm(form);
      toast.success('Профиль успешно обновлён!');
    } catch (e) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new.length < 8) {
      toast.error('Новый пароль должен быть минимум 8 символов');
      return;
    }

    try {
      await authService.changePassword(passwords.old, passwords.new);
      toast.success('Пароль успешно изменён!');
      setPasswords({ old: '', new: '' });
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        toast.error('Старый пароль введён неверно');
      } else {
        toast.error('Ошибка при смене пароля');
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast('Выберите файл', { icon: 'ℹ️' });
      return;
    }

    try {
      await authService.uploadAvatar(avatarFile);
      const updated = await authService.getProfile();
      setUser(updated);
      toast.success('Аватар успешно загружен!');
    } catch {
      toast.error('Ошибка загрузки аватара');
    }
  };

  return (

      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white px-4 py-2 rounded"
          >
            На главную
          </button>
        <h1 className="text-2xl font-bold">Профиль</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
      <div className="flex flex-col items-center md:w-1/3">
        <label className="relative group cursor-pointer">
          <img
            src={
              user?.avatar_url
                ? `http://localhost:8080${user.avatar_url}?t=${Date.now()}`
                : '/default-avatar.png'
            }
            className="w-36 h-36 rounded-full object-cover border-2 border-gray-300 dark:border-zinc-700"
            alt="avatar"
          />

          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <span className="text-white text-sm font-medium">Сменить фото</span>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={e => setAvatarFile(e.target.files[0])}
            className="hidden"
          />
        </label>

        {avatarFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Выбрано: {avatarFile.name}
          </p>
        )}

        <button
          onClick={handleAvatarUpload}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
        >
          Сохранить аватар
        </button>
      </div>

        <div className="md:w-2/3 space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Имя пользователя</label>
            <input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"

            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Полное имя</label>
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"

            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Описание</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"

              rows={3}
            />
          </div>

          <button
            onClick={handleProfileSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
          >
            Сохранить изменения
          </button>

          <hr className="my-4 border-gray-300 dark:border-zinc-700" />

          <div>
            <h2 className="text-lg font-semibold mb-2">Сменить пароль</h2>
            <input
              type="password"
              placeholder="Старый пароль"
              value={passwords.old}
              onChange={e => setPasswords({ ...passwords, old: e.target.value })}
              className="w-full border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 mb-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
            />
            <input
              type="password"
              placeholder="Новый пароль (мин. 8 символов)"
              value={passwords.new}
              onChange={e => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 mb-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
            >
              Изменить пароль
            </button>
          </div>

          <button
            onClick={logout}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Выйти
          </button>
          </div>
        </div>
      </div>


  );
};

export default ProfilePage;