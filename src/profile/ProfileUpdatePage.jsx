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
        full_name: user.full_name || '',
        description: user.description || ''
      };
      setForm(data);
      setInitialForm(data);
    }
  }, [user]);

  const handleProfileSave = async () => {
    const diff = {};
    if (form.username !== initialForm.username) diff.username = form.username;
    if (form.full_name !== initialForm.full_name) diff.full_name = form.full_name;
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

      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            На главную
          </button>
        <h1 className="text-2xl font-bold">Профиль</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={
              user?.avatar_url
                ? `http://localhost:8080${user.avatar_url}?t=${Date.now()}`
                : '/default-avatar.png'
            }
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <input
            type="file"
            className="mb-2"
            onChange={e => setAvatarFile(e.target.files[0])}
          />
          <button
            onClick={handleAvatarUpload}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
          >
            Загрузить аватар
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Имя пользователя</label>
            <input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Полное имя</label>
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Описание</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <button
            onClick={handleProfileSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
          >
            Сохранить изменения
          </button>

          <hr className="my-4" />

          <div>
            <h2 className="text-lg font-semibold mb-2">Сменить пароль</h2>
            <input
              type="password"
              placeholder="Старый пароль"
              value={passwords.old}
              onChange={e => setPasswords({ ...passwords, old: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <input
              type="password"
              placeholder="Новый пароль (мин. 8 символов)"
              value={passwords.new}
              onChange={e => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-2"
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