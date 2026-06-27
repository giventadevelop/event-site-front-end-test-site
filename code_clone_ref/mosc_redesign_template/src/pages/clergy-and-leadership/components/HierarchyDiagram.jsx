import React from 'react';
import Image from '../../../components/AppImage';


const HierarchyDiagram = () => {
  const hierarchyData = [
    {
      level: 1,
      title: "His Holiness Catholicos",
      name: "Baselios Marthoma Mathews III",
      position: "Supreme Head of the Church",
      image: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      description: "The spiritual leader and supreme head of the Malankara Orthodox Syrian Church"
    },
    {
      level: 2,
      title: "Metropolitan Bishops",
      members: [
        {
          name: "H.G. Dr. Yuhanon Mar Diascoros",
          diocese: "Kochi Diocese",
          image: "https://images.pexels.com/photos/8566464/pexels-photo-8566464.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
          ordination: "1995"
        },
        {
          name: "H.G. Dr. Geevarghese Mar Coorilos",
          diocese: "Niranam Diocese", 
          image: "https://images.pexels.com/photos/8566466/pexels-photo-8566466.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
          ordination: "1998"
        },
        {
          name: "H.G. Dr. Thomas Mar Koorilos",
          diocese: "Thiruvalla Diocese",
          image: "https://images.pexels.com/photos/8566468/pexels-photo-8566468.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
          ordination: "2001"
        }
      ]
    },
    {
      level: 3,
      title: "Priests & Vicars",
      description: "Parish priests serving local congregations across various dioceses"
    },
    {
      level: 4,
      title: "Deacons",
      description: "Ordained ministers assisting in liturgical and pastoral duties"
    }
  ];

  return (
    <div className="bg-card rounded-lg p-6 sacred-shadow">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
          Church Hierarchy
        </h3>
        <p className="text-muted-foreground font-body">
          Organizational structure of the Malankara Orthodox Syrian Church
        </p>
      </div>
      <div className="space-y-8">
        {/* Catholicos Level */}
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-24 h-24 mx-auto mb-4 circular-frame overflow-hidden bg-muted">
              <Image
                src={hierarchyData?.[0]?.image}
                alt={hierarchyData?.[0]?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-2">
              {hierarchyData?.[0]?.title}
            </div>
            <h4 className="font-heading font-semibold text-lg text-foreground">
              {hierarchyData?.[0]?.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {hierarchyData?.[0]?.position}
            </p>
          </div>
          
          {/* Connection Line */}
          <div className="flex justify-center my-6">
            <div className="w-px h-8 bg-border"></div>
          </div>
        </div>

        {/* Metropolitan Bishops Level */}
        <div className="text-center">
          <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium inline-block mb-6">
            {hierarchyData?.[1]?.title}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {hierarchyData?.[1]?.members?.map((bishop, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 circular-frame overflow-hidden bg-muted">
                  <Image
                    src={bishop?.image}
                    alt={bishop?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h5 className="font-heading font-medium text-foreground text-sm mb-1">
                  {bishop?.name}
                </h5>
                <p className="text-xs text-muted-foreground mb-1">
                  {bishop?.diocese}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ordained: {bishop?.ordination}
                </p>
              </div>
            ))}
          </div>
          
          {/* Connection Lines */}
          <div className="flex justify-center my-6">
            <div className="w-px h-8 bg-border"></div>
          </div>
        </div>

        {/* Lower Hierarchy Levels */}
        <div className="space-y-4">
          {hierarchyData?.slice(2)?.map((level, index) => (
            <div key={index} className="text-center">
              <div className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium inline-block mb-2">
                {level?.title}
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {level?.description}
              </p>
              {index < hierarchyData?.slice(2)?.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="w-px h-6 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Supreme Authority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-muted-foreground">Episcopal Authority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-muted-foreground">Pastoral Ministry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyDiagram;