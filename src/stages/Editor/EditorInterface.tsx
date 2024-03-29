import React, { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { mapAtom, stageAtom } from "~/Experience";
import { useTranslation } from "~/utils/useTranslation";
import { TRANSLATIONS } from "~/translations";
import './style.css'
import { STAGES, STAGES_MAP } from "~/constants";
import { allItemsAtom, buildModeAtom } from "../Play/PlayStage";
import { ItemActions, draggedItemAtom, draggedItemRotationAtom, itemActionAtom, shopModeAtom } from "./EditorStage";
import Show from "~/components/Show";
import { isNullOrUndefined } from "~/utils/utils";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ItemEditor } from "./ItemEditor";
import { AlertType, createAlertBoxMessage } from "~/components/AlertBox";
import DayNightSwitch from "~/components/DayNightSwitch";
import { ItemProps } from "~/data/items";

export default function EditorInterface() {
  const [stage, setStage] = useAtom(stageAtom);
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [itemAction, setItemAction] = useAtom(itemActionAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);

  const onPlayClick = () => {
		setStage(STAGES[STAGES_MAP.PLAY_STAGE]);
    setBuildMode(false);
	};

  /** ITEM ACTIONS **/
  const onRotateClick = () => {
    if (isNullOrUndefined(draggedItem)) {
      return;
    }

		setDraggedItemRotation(
      draggedItemRotation === 3 ? 0 : draggedItemRotation + 1
    )
    setItemAction(ItemActions.ROTATE);
	};

  const onMoveClick = () => {
    if (isNullOrUndefined(draggedItem)) {
      return;
    }

    setItemAction((prev) => prev === ItemActions.MOVE ? ItemActions.NONE : ItemActions.MOVE);
  }
  
  const onDeleteClick = () => {
    if (isNullOrUndefined(draggedItem)) {
      return;
    }

    setItemAction((prev) => prev === ItemActions.MOVE ? ItemActions.NONE : ItemActions.DELETE);
  }

  useEffect(() => {
    if(draggedItem !== null && draggedItem !== undefined && draggedItem < items.length) {
      // @ts-ignore
      setItemSelected(items[draggedItem]);
    } else {
      setItemSelected(null);
    }
  }, [draggedItem])

  /** GO TO THE SHOP **/
  const onShopClick = () => {
    setShopMode(!shopMode);
  }
  
  /** REMOVE EVERYTHING FROM THE MAP **/
  const confirmText = useTranslation(TRANSLATIONS.editorStage.buttons.clean.confirmation);
  const cleanAlertText = useTranslation(TRANSLATIONS.editorStage.alertMsg.clean);
  const onCleanClick = () => {
    if (confirm(confirmText)) {
      setItemAction((prev) => prev === ItemActions.CLEAN_EVERYTHING ? ItemActions.NONE : ItemActions.CLEAN_EVERYTHING);
      createAlertBoxMessage(cleanAlertText, AlertType.SUCCESS);
    }
  }

  /** LOAD MAP **/
  const [map, setMap] = useAtom(mapAtom);
  const [items, setItems] = useState( map.items );
  const fileUploadMsg = useTranslation(TRANSLATIONS.editorStage.buttons.map.select);
  const mapSuccessMsg = useTranslation(TRANSLATIONS.editorStage.alertMsg.map.success);
  const mapErrorMsg = useTranslation(TRANSLATIONS.editorStage.alertMsg.map.error);
  const [fileName, setFileName] = useState(fileUploadMsg);
  const [fileSelected, seFileSelected] = useState(false);
  
  function clearFileInput(ctrl: any) {
    try {
      ctrl.value = null;
    } catch(ex) { }

    if (ctrl.value) {
      ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
    }

    setFileName(fileUploadMsg);
    seFileSelected(false);
  }

  const loadMap = () => {
    // @ts-ignore
    let fileToLoad = document.getElementById("fileToLoad")?.files[0];
    if (!fileToLoad) {
      createAlertBoxMessage(mapErrorMsg, AlertType.ERROR);
      return;
    }
  
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      // @ts-ignore
      let textFromFileLoaded = fileLoadedEvent.target.result;
      let newMap = JSON.parse(textFromFileLoaded as string);
      setMap( newMap );
      clearFileInput(document.getElementById("fileToLoad"));

      createAlertBoxMessage(mapSuccessMsg, AlertType.SUCCESS);
    };
  
    fileReader.readAsText(fileToLoad, "UTF-8");
  }

  const file = document.querySelector('#fileToLoad');
  file?.addEventListener('change', (e: any) => {
    // Get the selected file
    const [file] = e.target.files;
    if (!file) return;

    // Get the file name and size
    const { name: fileName, size } = file;
    // Convert size in bytes to kilo bytes
    const fileSize = (size / 1000).toFixed(2);
    // Set the text content
    const fileNameAndSize = `${fileName} - ${fileSize}KB`;
    setFileName(fileNameAndSize);
    seFileSelected(true);
  });

  const [allItems] = useAtom(allItemsAtom);

  const [itemSelected, setItemSelected] = useState<ItemProps | null>(null);

  const shopItems = useMemo(() => { 
    return Object.values(allItems).map((item, index) => {
      const event = new CustomEvent("onItemSelectedForShop", { detail: item });

      const onClick = () => {
        document.dispatchEvent(event)
      }

      const onMouseEnter = () => {
        setItemSelected(item);
      }
      
      const onMouseLeave = () => {
        // @ts-ignore
        setItemSelected(null);
      }

      return (
        <>
          <div className="editor-items-row" key={index}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </>
      )
    })
  }, [items])

  /* Change map size by using slider */
  const sliderMinMax = {
    min: 5,
    max: 20
  }

  const [mapWidthDisplay, setMapWidthDisplay] = useState(map.size[0]);
  const [mapHeightDisplay, setMapHeightDisplay] = useState(map.size[1]);

  const onChangeWidth = (e: any) => {
    // @ts-ignore
    const widthMap = document.getElementById("widthMap")?.value;
    setMapWidthDisplay( widthMap );
  }
  
  const onChangeHeight = (e: any) => {
    // @ts-ignore
    const heightMap = document.getElementById("heightMap")?.value;
    setMapHeightDisplay( heightMap )
  }

  const onChangeMapSize = () => {
    map.size = [mapWidthDisplay, mapHeightDisplay];
    setMap(map);
  }

	return <>
  <div>
    <div className="editor-container">
      <div className="editor-elements-container">
        <div className="editor-buttons-container">
          <button onClick={onPlayClick}>
            {useTranslation(TRANSLATIONS.editorStage.buttons.stopEditing)}
          </button>
          
          <button
            onClick={onCleanClick}
            className={"button-red"}
          >
            {useTranslation(TRANSLATIONS.editorStage.buttons.clean.description)}
          </button>

          <DayNightSwitch />
        </div>
        
        <div>
          <label htmlFor="fileToLoad" className="input-button">
            {fileName}
              <input
              type="file"
              id="fileToLoad"
              accept=".json,.txt"
              className="input-button"
            />
          </label>

          <input
            type="file"
            id="fileToLoad"
            accept=".json,.txt"
            className="input-button"
          />

          <button onClick={loadMap}
            className={fileSelected ? "button-enabled" : "button-disabled"}
            disabled={!fileSelected}
          >
            {useTranslation(TRANSLATIONS.editorStage.buttons.map.load)}
          </button>
        </div>

        <div>
          <div className="slidecontainer">
            <label htmlFor="widthMap">Width: {mapWidthDisplay}</label>
            <input type="range" id="widthMap" min={sliderMinMax.min} max={sliderMinMax.max} defaultValue={map.size[0]} className="inputRange" onChange={onChangeWidth} />
            <span className="slideLabels">
              <span className="slideLabelLeft">{sliderMinMax.min}</span>
              <span className="slideLabelRight">{sliderMinMax.max}</span>
            </span>
          </div>
          
          <div className="slidecontainer">
            <label htmlFor="heightMap">Height: {mapHeightDisplay}</label>
            <input type="range" id="heightMap" min={sliderMinMax.min} max={sliderMinMax.max} defaultValue={map.size[1]} className="inputRange" onChange={onChangeHeight}/>
            <span className="slideLabels">
              <span className="slideLabelLeft">{sliderMinMax.min}</span>
              <span className="slideLabelRight">{sliderMinMax.max}</span>
            </span>
          </div>

          <button onClick={onChangeMapSize}>
            Change
          </button>
        </div>
      </div>
      
      <div className="editor-items-container">
        {shopItems}
      </div>
    </div>

    <div className="editor-item-preview">
      {useTranslation(TRANSLATIONS.editorStage.itemPreviewm.title)}
    </div>

  <div className="editor-item-area">
    <Canvas className="previewItem"
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [1.75, 3.5, 5],
      }}
    >
      <color attach="background" args={['#faf8eb']} />
      <OrbitControls target={[ 0, 0.5, 0]}/>
      {
        !isNullOrUndefined(itemSelected) && (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight intensity={0.3} castShadow />
    
            {/* Item Preview */}
            <ItemEditor 
              // @ts-ignore
              item={itemSelected} 
            />
          </>
        )
      }
    </Canvas>
</div>

  <Show when={(!isNullOrUndefined(draggedItem))}>
      <div className={"editor-draggedItem-container"}>
        <button
          onClick={onMoveClick}
          className={itemAction === ItemActions.MOVE ? "button-enabled" : "button-disabled"}
          style={{
            backgroundImage: `url("assets/icons/move.png")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '40px',
            height: '40px',
          }}
        >
          {/* {useTranslation(TRANSLATIONS.editorStage.buttons.item.move)} */}
        </button>

        <button onClick={onRotateClick} 
        style={{
          backgroundImage: `url("assets/icons/rotate.png")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '40px',
          height: '40px',
        }}>
          {/* {useTranslation(TRANSLATIONS.editorStage.buttons.item.rotate)} */}
        </button>

        <button
          onClick={onDeleteClick}
          className={"button-red"}
          style={{
            backgroundImage: `url("assets/icons/delete.png")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '40px',
            height: '40px',
            marginLeft: '15px',
          }}
        >
          {/* {useTranslation(TRANSLATIONS.editorStage.buttons.item.delete)} */}
        </button>
      </div>
    </Show>
  </div>
  </>
}