import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const eventsData = [
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/event_9-255x155.jpg",
    title: "Shaman stories & celebrations",
    location: "Manhattan Club, 350 5th Ave, New York, NY, United States",
    time: "8 pm",
    date: "Jan. 08 / 26",
    href: "/event/shaman-stories-celebrations-2/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/event_8-255x155.jpg",
    title: "Paint games on the streets",
    location: "Manhattan Club, 350 5th Ave, New York, NY, United States",
    time: "10 pm",
    date: "Jan. 10 / 26",
    href: "/event/paint-games-on-the-streets-2/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/event_7-255x155.jpeg",
    title: "African history of one tribe",
    location: "Manhattan Club, 350 5th Ave, New York, NY, United States",
    time: "6 pm",
    date: "Jan. 06 / 26",
    href: "/event/african-history-of-one-tribe-2/",
  },
];

const EventListItem = ({ event, isLast }: { event: typeof eventsData[0]; isLast: boolean }) => (
  <Link
    href={event.href}
    className={`flex justify-between items-start gap-4 group pb-6 ${!isLast ? 'border-b border-border' : ''}`}
  >
    <div className="flex gap-4 items-start">
      <Image
        src={event.image}
        alt={`Featured Image for ${event.title}`}
        width={100}
        height={61}
        className="rounded-lg object-cover mt-1 flex-shrink-0"
      />
      <div>
        <h5 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h5>
        <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 pl-4">
      <p className="text-3xl font-bold text-primary whitespace-nowrap">{event.time}</p>
      <p className="text-sm text-muted-foreground">{event.date}</p>
    </div>
  </Link>
);

const EventsSection = () => {
    const mainEventCardStyle = {
        backgroundColor: '#212529',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // The original design uses a background image with a dark overlay.
        // As the image is not provided, a solid dark color is used as a placeholder.
        // In a real scenario, this would be:
        // backgroundImage: 'url("/path/to/night-with-african-culture.jpg")',
    };

    return (
        <section className="bg-background py-24">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-24 items-start">
                    
                    {/* Left Column: Upcoming Events */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary -mt-0.5"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary -mt-0.5"></span>
                                <p className="text-sm font-semibold text-muted-foreground ml-1 tracking-wider uppercase">Events</p>
                            </div>
                            <h2 className="text-4xl font-bold text-foreground mt-4 leading-tight">
                                Exciting events <br /> & announcements
                            </h2>
                        </div>
                        
                        <div className="space-y-6">
                            {eventsData.map((event, index) => (
                                <EventListItem key={event.title} event={event} isLast={index === eventsData.length - 1} />
                            ))}
                        </div>
                        
                        <div className="mt-12">
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center gap-3 self-start rounded-full border-2 border-yellow-accent px-8 py-4 text-base font-medium text-foreground transition-all duration-300 hover:bg-yellow-accent hover:shadow-lg"
                            >
                                <span>See all events</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Main Event Card */}
                    <div className="relative mt-8 lg:mt-0">
                        <div 
                            className="text-white rounded-2xl min-h-[550px] flex flex-col p-10 lg:p-14"
                            style={mainEventCardStyle}
                        >
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-yellow-accent tracking-wider uppercase">Main event</p>
                                <h4 className="text-4xl font-bold mt-4 leading-tight">
                                    Night with <br /> African culture
                                </h4>
                                <p className="mt-4 text-lg text-[#adb5bd]">
                                    Starry flounder sablefish<br/>
                                    yellowtail barracuda long-finned
                                </p>
                            </div>
                            <div>
                                <p className="text-base text-[#adb5bd]">Jan. 15 / 22 – 10pm</p>
                                <p className="text-base text-[#adb5bd] mt-1">Manhattan Club 350 5th Ave, New York, NY</p>
                                <Link
                                    href="/event/food-donations-event/"
                                    className="inline-flex items-center justify-center gap-3 self-start rounded-full border-2 border-yellow-accent px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:bg-yellow-accent hover:text-foreground mt-8"
                                >
                                    <span>Explore more</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -bottom-24 -right-12 -z-10 text-[180px] font-bold text-cyan-accent opacity-10 transform -rotate-[15deg] select-none pointer-events-none" aria-hidden="true">
                            Events
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventsSection;