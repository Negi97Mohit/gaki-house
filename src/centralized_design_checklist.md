# Centralized Design Architecture Checklist

This document outlines the mandatory architecture and features for all design layouts in the application. All designs must adhere to these standards to ensure consistency, editability, and responsiveness.

## Core Architecture Files
The centralized system relies on the following core components located in `src/components/layouts/dynamic/core`:

1.  **`DynamicLayoutWrapper`**: Top-level provider for state, colors, and auto-hide logic.
2.  **`DynamicLayoutContext`**: React context exposing `layout`, `editor`, `colors`, and `controlsVisible`.
3.  **`EditableText`**: Component for all user-editable text fields.
4.  **`LayoutButtons`**: Contains `DynamicAddButton` and `DynamicDeleteButton` for panel management.
5.  **`LayoutSettingsCtrl`**: Global settings controller (background/text color) - handled automatically by the Wrapper.
6.  **`LayoutEditorToolbar`**: Floating toolbar for text styling - handled automatically by the Wrapper.

## Checklist Requirements

### 1. Structure & Wrapper
- [ ] **Must wrap content in `<DynamicLayoutWrapper>`**:
    ```tsx
    <DynamicLayoutWrapper
        layout={layout}
        onLayoutUpdate={onLayoutUpdate}
        sections={sections}
        defaultBackgroundColor="#ffffff" // Optional default
        defaultTextColor="#000000"       // Optional default
    >
        {/* Your Layout Content Here */}
    </DynamicLayoutWrapper>
    ```
- [ ] **Must use `useDynamicLayout()` hook**:
    - Access `colors` (background/text), `controlsVisible` (for UI hiding), `sections`, and `editor` from this hook.
    - Do NOT pass props down manually if they are available in context.

### 2. Text Editability
- [ ] **ALL text must be editable**:
    - Never string literals.
    - Use `<EditableText>` for every title, description, label, or button text.
    - Example:
      ```tsx
      <EditableText
          sectionId={section.id}
          fieldId="title"
          defaultValue="Default Title"
          className="text-4xl font-bold"
      />
      ```

### 3. Colors & Background
- [ ] **Background & Text Color Customization**:
    - The root container provided by `DynamicLayoutWrapper` already handles the main background and text color application.
    - Ensure your inner components respect `colors.textColor` (or inherit it) effectively.
    - If you have specific elements that need to match the theme transparency or borders, use `colors.textColor` for standardizing look.

### 4. Dynamic Panels (Add/Remove)
- [ ] **Must support Adding Panels**:
    - Include strictly one `<DynamicAddButton />` (usually at the end of a list or grid).
    - It must be conditionally visible (handled by the component itself ideally, or check `controlsVisible` if you are positioning it absolutely).
- [ ] **Must support Removing Panels**:
    - Every section/panel must include a `<DynamicDeleteButton sectionId={section.id} />`.
    - Position it (absolute) so it is easily accessible but doesn't block content.

### 5. Auto-Hide Functionality (Inactivity)
- [ ] **UI Controls must auto-hide**:
    - The `DynamicLayoutWrapper` tracks inactivity (3 seconds).
    - Access `const { controlsVisible } = useDynamicLayout();`.
    - Any functional UI (delete buttons, add buttons, arrows, specialized controls) MUST fade out when `!controlsVisible`.
    - Apply `opacity-0 pointer-events-none` when hidden.
    - `DynamicAddButton` and `DynamicDeleteButton` handle this internally, but if you have custom navigation arrows or toolbars, apply it manually.

### 6. Responsive Design
- [ ] **Fully Responsive**:
    - Design must look good on specific breakpoints (Mobile, Tablet, Desktop).
    - Use Tailwind responsive prefixes (`md:`, `lg:`, etc.) or dynamic sizing (`vh`, `vw`, `%`).
    - **Scrollbar Hiding**: The main container should handle overflow gracefully. The global scrollbar style should be minimal or hidden unless scrolling.

## Example Implementation Pattern

```tsx
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";
import { EditableText } from "./dynamic/core/EditableText";
import { DynamicAddButton, DynamicDeleteButton } from "./dynamic/core/LayoutButtons";

const MyLayoutContent = () => {
    const { sections, colors, controlsVisible } = useDynamicLayout();

    return (
        <div className="w-full h-full overflow-y-auto">
            {sections.map(section => (
                <div key={section.id} className="relative p-10 border-b" style={{ borderColor: colors.textColor }}>
                    <EditableText sectionId={section.id} fieldId="title" defaultValue="New Section" />
                    
                    {/* Delete Button - Auto-hides */}
                    <DynamicDeleteButton sectionId={section.id} className="absolute top-4 right-4" />
                </div>
            ))}
            
            {/* Add Button */}
            <div className="p-10 flex justify-center">
                <DynamicAddButton />
            </div>
        </div>
    );
};

export const MyLayout = (props) => (
    <DynamicLayoutWrapper {...props}>
        <MyLayoutContent />
    </DynamicLayoutWrapper>
);
```
