import React from "react";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

const causesData = [
  {
    category: "Charity",
    categoryColor: "bg-[#4A90E2]",
    title: "Help for the needy",
    description: "Pink salmon cherry salmon combtail gourami frigate mackerel snake.",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2023/06/cause_4-640x476.jpeg",
    raised: 47460,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/help-for-the-needy/",
  },
  {
    category: "Health",
    categoryColor: "bg-[#17A2B8]",
    title: "Medical assistance",
    description: "Michog paradise fish! Triggerfish bango guppy opah sunfish bluntnose",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/cause_5-640x476.jpg",
    raised: 32395,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/medical-assistance/",
  },
  {
    category: "Donation",
    categoryColor: "bg-[#E91E63]",
    title: "Fees for victims",
    description: "Cobia spookfish convict cichlid cat shark saw shark trout cod",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2023/06/cause_6-640x476.jpeg",
    raised: 112695,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/fees-for-victims/",
  },
  {
    category: "Health",
    categoryColor: "bg-[#17A2B8]",
    title: "Water cleaning in Uganda",
    description: "Pink salmon cherry salmon combtail gourami frigate mackerel snake.",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/cause_10-640x476.jpg",
    raised: 1030000,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/water-delivery-in-africa/",
  },
  {
    category: "Medicine",
    categoryColor: "bg-[#E91E63]",
    title: "Health medicine for children",
    description: "Michog paradise fish! Triggerfish bango guppy opah sunfish bluntnose",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/cause_11-640x476.jpg",
    raised: 1070000,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/health-medicine-for-children-2/",
  },
  {
    category: "Education",
    categoryColor: "bg-[#28A745]",
    title: "We build school",
    description: "Cobia spookfish convict cichlid cat shark saw shark trout cod",
    imageUrl: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/cause_12-640x476.jpg",
    raised: 45246,
    goal: 100000,
    link: "https://demo.artureanec.com/themes/philantrop/cause/we-build-school/",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CausesGrid = () => {
  return (
    <section className="bg-secondary py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <div className="md:max-w-[40%]">
            <p className="font-medium text-primary tracking-[0.2em] mb-4 text-sm uppercase">Causes</p>
            <h2 className="text-[36px] leading-[1.3] font-bold text-foreground">
              Some causes <br />
              we have in Africa
            </h2>
          </div>
          <a
            href="https://demo.artureanec.com/themes/philantrop/causes/"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 border border-[#F9C23C] text-[#212529] text-sm font-medium h-12 px-6 rounded-full hover:bg-[#F9C23C] hover:text-white transition-colors duration-300"
          >
            <span>More causes</span>
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causesData.map((cause, index) => {
            const percentage = Math.min(100, (cause.raised / cause.goal) * 100);

            return (
              <div key={index} className="bg-card border border-border rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:-translate-y-2">
                <div className="p-8">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold text-primary-foreground rounded-md ${cause.categoryColor}`}>
                    {cause.category}
                  </span>
                  <h5 className="mt-4 mb-2 text-xl font-semibold text-foreground">
                    <a href={cause.link} className="hover:text-primary transition-colors">
                      {cause.title}
                    </a>
                  </h5>
                  <p className="text-base text-medium-gray leading-relaxed">
                    {cause.description}
                  </p>
                </div>

                <div className="relative w-full aspect-[640/476] mt-auto">
                  <Image
                    src={cause.imageUrl}
                    alt={cause.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-full bg-progress-background rounded-full h-[8px] overflow-hidden">
                      <div
                        className="bg-green-accent h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      {percentage % 1 === 0 ? percentage : percentage.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-base text-medium-gray mb-6">
                    <span className="font-bold text-foreground">{formatCurrency(cause.raised)}</span> of {formatCurrency(cause.goal)} raised
                  </p>
                  <a href={cause.link} className="w-full text-center inline-flex items-center justify-center gap-2 border border-[#F9C23C] text-[#212529] text-sm font-medium h-12 px-6 rounded-full hover:bg-[#F9C23C] hover:text-white transition-colors duration-300">
                    <span>Donate</span>
                    <Plus size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CausesGrid;