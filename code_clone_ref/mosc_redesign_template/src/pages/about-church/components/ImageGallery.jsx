import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('architecture');

  const galleryData = {
    architecture: {
      title: 'Church Architecture',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          alt: 'Traditional Orthodox Church exterior',
          caption: 'St. Mary\'s Orthodox Cathedral, Kottayam'
        },
        {
          src: 'https://images.unsplash.com/photo-1520637736862-4d197d17c93a?w=400&h=300&fit=crop',
          alt: 'Church interior with iconostasis',
          caption: 'Interior of Orthodox Church with traditional iconostasis'
        },
        {
          src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          alt: 'Ancient church ruins',
          caption: 'Ancient church foundations in Kerala'
        },
        {
          src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
          alt: 'Modern Orthodox church',
          caption: 'Contemporary Orthodox church design'
        }
      ]
    },
    ceremonies: {
      title: 'Religious Ceremonies',
      images: [
        {
          src: 'https://images.pexels.com/photos/8468/candles-church-light-religion.jpg?w=400&h=300&fit=crop',
          alt: 'Liturgical candles during service',
          caption: 'Holy Qurbana celebration with liturgical candles'
        },
        {
          src: 'https://images.pexels.com/photos/372326/pexels-photo-372326.jpeg?w=400&h=300&fit=crop',
          alt: 'Orthodox baptism ceremony',
          caption: 'Traditional Orthodox baptism ceremony'
        },
        {
          src: 'https://images.pexels.com/photos/1666816/pexels-photo-1666816.jpeg?w=400&h=300&fit=crop',
          alt: 'Wedding ceremony in church',
          caption: 'Orthodox wedding ceremony'
        },
        {
          src: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?w=400&h=300&fit=crop',
          alt: 'Ordination ceremony',
          caption: 'Priestly ordination ceremony'
        }
      ]
    },
    heritage: {
      title: 'Cultural Heritage',
      images: [
        {
          src: 'https://images.pixabay.com/photo/2019/12/14/08/36/manuscript-4694581_1280.jpg?w=400&h=300&fit=crop',
          alt: 'Ancient Syriac manuscript',
          caption: 'Ancient Syriac liturgical manuscript'
        },
        {
          src: 'https://images.pixabay.com/photo/2017/08/06/12/06/people-2592247_1280.jpg?w=400&h=300&fit=crop',
          alt: 'Traditional Orthodox vestments',
          caption: 'Traditional liturgical vestments'
        },
        {
          src: 'https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg?w=400&h=300&fit=crop',
          alt: 'Orthodox icon painting',
          caption: 'Traditional Orthodox iconography'
        },
        {
          src: 'https://images.pixabay.com/photo/2018/01/21/01/46/architecture-3096685_1280.jpg?w=400&h=300&fit=crop',
          alt: 'Historical church artifacts',
          caption: 'Ancient church artifacts and relics'
        }
      ]
    }
  };

  const categories = Object.keys(galleryData);

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
          <Icon name="Camera" size={20} color="white" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-foreground">Image Gallery</h2>
      </div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories?.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-body font-medium reverent-transition ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {galleryData?.[category]?.title}
          </button>
        ))}
      </div>
      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleryData?.[selectedCategory]?.images?.map((image, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="circular-frame overflow-hidden aspect-[4/3] mb-3 group-hover:scale-105 reverent-transition">
              <Image
                src={image?.src}
                alt={image?.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {image?.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Gallery Information */}
      <div className="mt-8 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              Visual Heritage
            </h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              These images represent the rich visual heritage of the Malankara Orthodox Syrian Church, 
              showcasing our architectural traditions, liturgical practices, and cultural artifacts 
              that have been preserved through centuries of faithful stewardship. Each image tells 
              a story of our continuous journey from apostolic times to the present day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;