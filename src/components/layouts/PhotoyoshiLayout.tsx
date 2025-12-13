import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

interface PhotoyoshiProject {
  id: string;
  title: string;
  category: string;
  count: number;
  image: string;
}

interface PhotoyoshiLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  containerRef: React.RefObject<HTMLDivElement>;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

const defaultProjects: PhotoyoshiProject[] = [
  { id: "1", title: "Interior", category: "interior", count: 42, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800" },
  { id: "2", title: "Portrait", category: "portrait", count: 40, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800" },
  { id: "3", title: "Landscape", category: "landscape", count: 18, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
];

export const PhotoyoshiLayout: React.FC<PhotoyoshiLayoutProps> = ({
  layout,
  template,
  containerRef,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [projects, setProjects] = useState<PhotoyoshiProject[]>(defaultProjects);
  const [selectedProject, setSelectedProject] = useState<PhotoyoshiProject | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState(projects[0]?.image || "");
  const [siteTitle, setSiteTitle] = useState("PHOTOYOSHI");
  const [tagline, setTagline] = useState("Capturing moments through a unique lens. A visual journey of light, shadow, and emotion.");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingTagline, setIsEditingTagline] = useState(false);

  useEffect(() => {
    if (hoveredProject) {
      const project = projects.find(p => p.id === hoveredProject);
      if (project) {
        setHeroImage(project.image);
      }
    } else if (projects.length > 0) {
      setHeroImage(projects[0].image);
    }
  }, [hoveredProject, projects]);

  const handleAddProject = () => {
    const newProject: PhotoyoshiProject = {
      id: `project-${Date.now()}`,
      title: "New Category",
      category: "new",
      count: 0,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    };
    setProjects([...projects, newProject]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleProjectClick = (project: PhotoyoshiProject) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  const handleProjectTitleEdit = (id: string, newTitle: string) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, title: newTitle } : p
    ));
  };

  const handleProjectCountEdit = (id: string, newCount: number) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, count: newCount } : p
    ));
  };

  // Project detail view
  if (selectedProject) {
    const section = layout.sections[0] || { id: "main", content: { type: "empty" } };
    const templateSection = template.sections[0];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full h-full overflow-hidden"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        {/* Full-screen project image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={selectedProject.image}
            alt={selectedProject.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Project title overlay */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 p-12"
        >
          <h1 
            className="text-[12vw] font-light text-white tracking-tighter leading-none"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {selectedProject.title}
          </h1>
          <p className="text-white/80 text-lg mt-4 tracking-wide">
            ( {selectedProject.count} )
          </p>
        </motion.div>

        {/* Grid content overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-500">
            {templateSection && (
              <GridSectionWrapper
                {...wrapperProps}
                section={section}
                templateSection={templateSection}
                isHovered={true}
              />
            )}
          </div>
        </div>

        {/* Back button - bottom-left, above video controls */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleBackToList}
          className="fixed bottom-24 left-6 z-50 flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-widest text-white/90 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </motion.button>
      </motion.div>
    );
  }

  // Main grid view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full overflow-y-auto"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        {/* Hero Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroImage}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f5f0e8]" />
          </motion.div>
        </AnimatePresence>

        {/* Large Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[15vw] font-light tracking-tighter text-white mix-blend-difference select-none"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {isEditingTitle ? (
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                className="bg-transparent text-center outline-none border-b-2 border-white/50 w-full"
              />
            ) : (
              <span onClick={() => setIsEditingTitle(true)} className="cursor-text">
                {siteTitle}
              </span>
            )}
          </motion.h1>
        </div>

        {/* Photo Count Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute top-6 right-6 text-white/80 text-sm tracking-widest"
        >
          /{projects.reduce((sum, p) => sum + p.count, 0)}Photos
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="relative px-8 py-12" style={{ backgroundColor: "#f5f0e8" }}>
        {/* Category Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative group"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <button
                onClick={() => handleProjectClick(project)}
                className={cn(
                  "px-6 py-3 rounded-full text-sm tracking-wide transition-all duration-300",
                  "bg-[#1a1a1a] text-[#f5f0e8] hover:bg-[#333]",
                  hoveredProject === project.id && "scale-105 shadow-lg"
                )}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                <span 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleProjectTitleEdit(project.id, e.currentTarget.textContent || "")}
                  className="outline-none font-medium"
                >
                  {project.title}
                </span>
                <span className="ml-2 opacity-60">
                  ( <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleProjectCountEdit(project.id, parseInt(e.currentTarget.textContent || "0"))}
                    className="outline-none"
                  >{project.count}</span> )
                </span>
              </button>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}

          {/* Add Category Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={handleAddProject}
            className="px-6 py-3 rounded-full text-sm tracking-wide border-2 border-dashed border-[#1a1a1a]/30 text-[#1a1a1a]/60 hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-xl mb-12"
        >
          {isEditingTagline ? (
            <textarea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              onBlur={() => setIsEditingTagline(false)}
              autoFocus
              className="w-full bg-transparent text-[#1a1a1a]/70 text-lg leading-relaxed tracking-wide outline-none border-b border-[#1a1a1a]/20 resize-none"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              rows={3}
            />
          ) : (
            <p
              onClick={() => setIsEditingTagline(true)}
              className="text-[#1a1a1a]/70 text-lg leading-relaxed tracking-wide cursor-text"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {tagline}
            </p>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-4 text-[#1a1a1a]/40 text-xs tracking-widest"
        >
          <span>Scroll :</span>
          <div className="w-24 h-0.5 bg-[#1a1a1a]/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1a1a1a]/60"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </motion.div>

        {/* Grid Sections Below */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.15 }}
              onClick={() => handleProjectClick(project)}
              className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium tracking-wide">{project.title}</p>
                <p className="text-white/60 text-xs">( {project.count} )</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setProjects([])}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <Trash2 className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};
