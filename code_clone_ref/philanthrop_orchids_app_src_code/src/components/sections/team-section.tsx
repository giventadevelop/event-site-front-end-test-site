import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const teamMembersData = [
  {
    id: 'dmytro',
    name: 'Dmytro Savchuk',
    role: 'Head Volunteer',
    imageUrl: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/team_3-305x418.jpg',
    verticalText: 'Help',
    overlayGradient: 'linear-gradient(20deg, rgba(249, 194, 60, 0.7) 0%, rgba(255, 230, 160, 0.7) 100%)',
    gridPosition: 'lg:col-start-7 lg:col-span-5 lg:row-start-2 justify-self-start',
  },
  {
    id: 'serhiy',
    name: 'Serhiy Demchuk',
    role: 'Volunteer',
    imageUrl: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/team_4-305x418.jpg',
    verticalText: 'Charity',
    overlayGradient: 'linear-gradient(20deg, rgba(255, 107, 53, 0.7) 0%, rgba(255, 160, 122, 0.7) 100%)',
    gridPosition: 'lg:col-start-8 lg:col-span-5 lg:row-start-3 justify-self-center -mt-16',
  },
  {
    id: 'ivan',
    name: 'Ivan Schevcenko',
    role: 'Volunteer',
    imageUrl: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/team_1-305x418.jpg',
    verticalText: 'Pray',
    overlayGradient: 'linear-gradient(20deg, rgba(82, 222, 100, 0.7) 0%, rgba(138, 255, 154, 0.7) 100%)',
    gridPosition: 'lg:col-start-2 lg:col-span-5 lg:row-start-3 justify-self-center mt-12',
  },
  {
    id: 'denis',
    name: 'Denis Klopotenko',
    role: 'Volunteer',
    imageUrl: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/team_2-305x418.jpg',
    verticalText: 'Donate',
    overlayGradient: 'linear-gradient(20deg, rgba(74, 144, 226, 0.7) 0%, rgba(136, 193, 255, 0.7) 100%)',
    gridPosition: 'lg:col-start-4 lg:col-span-5 lg:row-start-4 justify-self-center -mt-12',
  },
];

interface TeamMemberCardProps {
  member: typeof teamMembersData[0];
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => (
  <div className="w-[265px] relative">
    <div className="relative group">
      <a href="#" className="block w-[265px] h-[364px]">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={member.imageUrl}
            alt={member.name}
            width={305}
            height={418}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: member.overlayGradient,
              mixBlendMode: 'color',
            }}
          ></div>
        </div>
      </a>
      <div className="absolute top-1/2 -right-[75px] -translate-y-1/2 transform -rotate-90 pointer-events-none">
        <p className="text-[72px] font-bold text-gray-100 uppercase tracking-widest whitespace-nowrap">
          {member.verticalText}
        </p>
      </div>
    </div>
    <div className="mt-6">
      <h5 className="text-[20px] font-bold text-[#212529]">
        <a href="#" className="hover:text-primary transition-colors">{member.name}</a>
      </h5>
      <p className="text-base text-muted-foreground mt-1">{member.role}</p>
    </div>
  </div>
);

const TeamSection = () => {
  return (
    <section className="bg-background py-24 overflow-x-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_repeat(3,_minmax(0,_1fr))] gap-y-16 lg:gap-x-8 lg:gap-y-0">
          <div className="lg:col-start-1 lg:col-span-6 lg:row-start-1 lg:row-span-2">
            <div className="max-w-lg">
              <p className="text-xs font-medium tracking-[0.2em] text-[#6c757d] uppercase flex items-center">
                <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: 'rgb(233, 30, 99)' }}></span>
                Team
              </p>
              <h2 className="text-[48px] font-bold text-[#212529] mt-3 leading-tight">
                Meet our the best volunteers team
              </h2>
              <Link
                href="#"
                className="group inline-flex items-center mt-9 px-7 py-4 border border-[#f9c23c] rounded-full text-base font-medium text-[#212529] hover:bg-[#f9c23c] transition-all duration-300 transform hover:scale-105"
              >
                Explore more
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          
          {teamMembersData.map((member) => (
            <div key={member.id} className={`${member.gridPosition} mt-8 lg:mt-0`}>
              <TeamMemberCard member={member} />
            </div>
          ))}

          <div className="lg:col-start-8 lg:col-span-5 lg:row-start-4 justify-self-end self-end relative pt-12">
            <div className="flex items-center">
              <span 
                className="font-bold text-[200px] leading-none" 
                style={{ 
                  WebkitTextStroke: '1px rgba(74, 144, 226, 0.2)',
                  textStroke: '1px rgba(74, 144, 226, 0.2)',
                  color: 'transparent' 
                }}
              >
                500+
              </span>
              <span 
                className="font-bold text-lg text-gray-400 uppercase ml-2" 
                style={{ writingMode: 'vertical-rl' }}
              >
                Team members
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;