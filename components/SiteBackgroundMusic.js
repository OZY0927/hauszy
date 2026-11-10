import {getProfile} from '../lib/firestore-server';
import {backgroundMusicUrl} from '../lib/background-music';
import BackgroundMusic from './BackgroundMusic';

export default async function SiteBackgroundMusic(){
 let url='';
 try{url=backgroundMusicUrl((await getProfile())?.backgroundMusicUrl)}catch{}
 return url?<BackgroundMusic url={url}/>:null;
}
