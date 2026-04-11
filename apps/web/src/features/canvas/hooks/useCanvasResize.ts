import { useEffect } from "react";
import { useCanvasStore } from "../model/canvas.store";

export const useCanvasResize = (
    containerRef: React.RefObject<HTMLElement>,
    sceneRef: React.RefObject<HTMLElement>,
    isFullscreen: boolean
) => {
    const setContainerSize = useCanvasStore((state) => state.setContainerSize);
    const setSceneSize = useCanvasStore((state) => state.setSceneSize);

    useEffect(() => {
        const container = containerRef.current;
        const scene = sceneRef.current;
        if (!container || !scene) return;

        const updateContainer = () =>
            setContainerSize({
                width: container.clientWidth,
                height: container.clientHeight,
            });
        const updateScene = () =>
            setSceneSize({ width: scene.clientWidth, height: scene.clientHeight });

        const roContainer = new ResizeObserver(updateContainer);
        const roScene = new ResizeObserver(updateScene);

        roContainer.observe(container);
        roScene.observe(scene);
        updateContainer();
        updateScene();

        return () => {
            roContainer.disconnect();
            roScene.disconnect();
        };
    }, [isFullscreen, setContainerSize, setSceneSize, containerRef, sceneRef]);
};
