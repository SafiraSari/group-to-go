import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import './Groups.css';

const Groups = () => {
  const username = localStorage.getItem('username');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groups, setGroups] = useState([]);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(null);

  // Load groups for user
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`http://localhost:3500/groups/user/${username}`);
        const data = await res.json();
        if (res.ok) setGroups(data);
        else console.error('Failed to load groups:', data.error);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, [username]);

  const handleOpenModal = (type) => {
    setMode(type);
    setModalOpen(true);
    setGroupName('');
    setGroupDesc('');
    setJoinCode('');
  };

  const handleCloseModal = () => setModalOpen(false);

  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleSubmit = async () => {
    if (mode === 'create') {
      const code = generateGroupCode();
      const groupPayload = {
        name: groupName,
        description: groupDesc,
        code,
        createdBy: username,
      };

      try {
        const res = await fetch('http://localhost:3500/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupPayload),
        });

        const data = await res.json();
        if (res.ok) {
          const newGroup = { ...groupPayload, id: data.groupId, members: [username] };
          setGroups((prev) => [...prev, newGroup]);
          alert(`Group "${groupName}" created!\nCode: ${code}`);
        } else {
          alert('Failed to create group: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong. Try again.');
      }
    } else if (mode === 'join') {
      try {
        const res = await fetch('http://localhost:3500/groups/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: joinCode, username }),
        });

        const data = await res.json();
        if (res.ok) {
          alert(`Successfully joined group!`);
          const updatedGroups = await fetch(`http://localhost:3500/groups/user/${username}`);
          const updatedData = await updatedGroups.json();
          setGroups(updatedData);
        } else {
          alert(data.error || 'Failed to join group');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong.');
      }
    }

    handleCloseModal();
  };

  const disbandGroup = async (group) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setGroups((prev) => prev.filter(g => g.id !== group.id));
      } else {
        alert('Failed to disband group: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error disbanding group');
    }
  };

  const kickMember = async (group, member) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername: member }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, members: g.members.filter((m) => m !== member) }
              : g
          )
        );
      } else {
        alert('Failed to kick member: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error kicking member');
    }
  };

  const leaveGroup = async (group) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setGroups((prev) => prev.filter(g => g.id !== group.id));
      } else {
        alert('Failed to leave group: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error leaving group');
    }
  };

  const toggleGroupDetails = (index) => {
    setExpandedGroupIndex(expandedGroupIndex === index ? null : index);
  };

  return (
    <>
      <NavBar />
      <div className="groups-container">
        <div className="header-title">
          <h1>GROUPS</h1>
        </div>

        <div className="groups-button-group">
          <Button label="+ Create Group" onClick={() => handleOpenModal('create')} />
          <Button label="Join Group" onClick={() => handleOpenModal('join')} />
        </div>

        {modalOpen && (
          <Modal onSubmit={handleSubmit} onCancel={handleCloseModal} onClose={handleCloseModal}>
            <h1 className="modal-title">
              {mode === 'create' ? 'Create a New Group' : 'Join an Existing Group'}
            </h1>
            {mode === 'create' ? (
              <>
                <Input
                  label="Group Name"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Input
                  label="Group Description"
                  placeholder="Enter description"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </>
            ) : (
              <Input
                label="Group Code"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            )}
          </Modal>
        )}

        <div className="groups-list">
          {groups.length === 0 ? (
            <p style={{ color: 'var(--GRAY)' }}>No groups created or joined yet.</p>
          ) : (
            groups.map((group, index) => (
              <div
                key={group.id || index}
                className="group-card"
                onClick={() => toggleGroupDetails(index)}
              >
                <div className="group-header">
                  <h3>{group.name}</h3>
                  <span className="group-code">Code: {group.code}</span>
                </div>

                {expandedGroupIndex === index && (
                  <div className="group-details">
                    <p><strong>Description:</strong> {group.description}</p>
                    <p><strong>Members:</strong></p>
                    <ul className="group-members-list">
                      {group.members?.map((member, i) => (
                        <li key={i} className="group-member-row">
                          <span className="group-member-name">{member}</span>
                          {username === group.createdBy && member !== username && (
                            <button
                              className="kick-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                kickMember(group, member);
                              }}
                            >
                              Kick
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '1rem' }}>
                      {username === group.createdBy ? (
                        <Button
                          label="Disband Group"
                          onClick={() => {
                            const confirmDelete = window.confirm(`Are you sure you want to disband "${group.name}"?`);
                            if (confirmDelete) disbandGroup(group);
                          }}
                        />
                      ) : (
                        <Button
                          label="Leave Group"
                          onClick={() => {
                            const confirmLeave = window.confirm(`Are you sure you want to leave "${group.name}"?`);
                            if (confirmLeave) leaveGroup(group);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Groups;
