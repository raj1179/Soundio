import axios from "axios";
import React, { useEffect, useState } from "react";

import {
	BiPauseCircle,
	BiPlayCircle,
	BiSkipNextCircle,
	BiSkipPreviousCircle,
} from "react-icons/bi";

import { GET_PLAYLISTS_ITEMS } from "../assets/constants";
import "./style/MusicGrid.css";

const userData = localStorage.getItem('data');
const USER_ID = userData && userData.length > 0 ? userData[0].ID : null;

const ViewPlaylist = ({ playlistID }) => {

  const [audioPlayers, setAudioPlayers] = useState([]);
	const [songs, setSongs] = useState([]);
	const [playlistName, setPlaylistsName] = useState('');

  const playAudio = async (url) => {
    try {
      const audioModule = await import(url);
      const audioPlayer = new Audio(audioModule.default); // Assuming the default export is the URL
      return audioPlayer;
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  };

  useEffect(() => {
    const createAudioPlayers = async () => {
      // Create audio players for each music item
      const players = await Promise.all(
        songs.map((music) => playAudio(music.url))
      );
      setAudioPlayers(players);
    };

    createAudioPlayers();

    return () => {
      // Clean up audio players on unmount
      audioPlayers.forEach((player) => player.pause());
    };
  }, [songs]);

  const handlePlayPause = (index) => {
    const newAudioPlayers = [...audioPlayers];
    const audioPlayer = newAudioPlayers[index];

    if (audioPlayer && audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }

    setAudioPlayers(newAudioPlayers);
  };

	const getPlaylistItem = async(playlistID) => {
		try {
			const response = await axios.post(
				GET_PLAYLISTS_ITEMS,{
					playlist: playlistID,
				},{
					headers:{
						'Content-Type': 'application/json',
					}
				}
			);
			return response.data;
		} catch (err) {
			console.error(err);
		}
	}

	useEffect(()=>{
		const loadPlaylistItem = async() => {
			try{
				const playlistItems = await getPlaylistItem(playlistID);
				setSongs(playlistItems);
				setPlaylistsName(playlistItems.P_name);
				console.log(playlistName);
			}catch(err){
				console.error("Error fetching data:", err);
			}
		}

		loadPlaylistItem();
	}, []);

  return (
    <div>
      <div className="music-grid">
        <h2 className="font-bold text-3xl text-white text-left">

        </h2>

        <div className="scrollable flex flex-wrap sm:justify-start justify-center gap-8">
          {songs.map((songs, index) => (
            <div className="music-item" key={index}>
              <h2 className="music-name">{songs.name}</h2>
              <h4 className="music-name">{songs.genre}</h4>
              <h4 className="music-name">{songs.url}</h4>
              <audio controls>
                <source src={songs.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              )
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewPlaylist;
