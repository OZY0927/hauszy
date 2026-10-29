'use client';
import {ArrowLeft,ArrowRight,ArrowUpRight,BadgeCheck,Banknote,Bath,BedDouble,Building2,Calculator,CalendarDays,Car,ChartPie,Check,ChevronDown,ChevronLeft,ChevronRight,CircleAlert,CircleCheck,Clock,Dumbbell,Flame,Globe,Heart,Hospital,House,Images,Info,KeyRound,Lightbulb,LocateFixed,Lock,LogIn,Mail,MapPin,Maximize2,MessageCircle,Pencil,Plus,RotateCcw,Ruler,Save,School,Search,Send,Share2,ShieldCheck,ShoppingBag,Sparkles,Table,TrainFront,Trees,TrendingUp,Users,Utensils,Wallet,Waves,X} from 'lucide-react';
// Lucide icons by short name. Size and colour follow the surrounding text (see .icon in globals.css).
const ICONS={arrowRight:ArrowRight,arrowLeft:ArrowLeft,arrowUpRight:ArrowUpRight,chevronDown:ChevronDown,chevronLeft:ChevronLeft,chevronRight:ChevronRight,x:X,check:Check,circleCheck:CircleCheck,circleAlert:CircleAlert,info:Info,
  search:Search,mapPin:MapPin,locate:LocateFixed,heart:Heart,share:Share2,message:MessageCircle,mail:Mail,calendar:CalendarDays,send:Send,
  calculator:Calculator,wallet:Wallet,banknote:Banknote,shieldCheck:ShieldCheck,badgeCheck:BadgeCheck,lock:Lock,key:KeyRound,
  home:House,building:Building2,globe:Globe,images:Images,maximize:Maximize2,refresh:RotateCcw,pencil:Pencil,save:Save,logIn:LogIn,plus:Plus,sparkles:Sparkles,
  bed:BedDouble,bath:Bath,ruler:Ruler,waves:Waves,dumbbell:Dumbbell,leaf:Trees,car:Car,flame:Flame,users:Users,
  school:School,hospital:Hospital,train:TrainFront,shoppingBag:ShoppingBag,utensils:Utensils,
  trendingUp:TrendingUp,pieChart:ChartPie,lightbulb:Lightbulb,clock:Clock,table:Table};
export default function Icon({name,filled=false,className=''}){const Svg=ICONS[name]||Sparkles;return <Svg className={`icon icon-${name}${className?' '+className:''}`} fill={filled?'currentColor':'none'} aria-hidden="true" focusable="false"/>}
