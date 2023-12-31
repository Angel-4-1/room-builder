import React from "react";
import { useAtom } from "jotai";
import { languageAtom, mapAtom, stageAtom } from "~/Experience";
import { useTranslation } from "~/utils/useTranslation";
import { TRANSLATIONS } from "~/translations";
import './style.css'
import { STAGES, STAGES_MAP } from "~/constants";
import { buildModeAtom } from "./PlayStage";

export default function PlayInterface() {
  const [language] = useAtom(languageAtom);
  const [stage, setStage] = useAtom(stageAtom);
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  const [map, setMap] = useAtom(mapAtom);

  const onBackClick = () => {
    setStage(STAGES[STAGES_MAP.INTRO_STAGE]);
  };

  const onEditorClick = () => {
    setStage(STAGES[STAGES_MAP.EDITOR_STAGE]);
    setBuildMode(true);
  };

  function download(content: string, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  const onDownload = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1; // month starts from 0
    const year = date.getFullYear();
    const fileName = "map" + "-" + day + "-" + month + "-" + year + ".txt";
    
    download(JSON.stringify(map), fileName, "text/plain");
  }

  return <div className="play-container">
    <div className="play-elements-container">
      <div className="play-buttons-container">
        <button onClick={onBackClick} className="button-red">
          {useTranslation(TRANSLATIONS.playStage.buttons.back)}
        </button>

        <button onClick={onEditorClick}>
          {useTranslation(TRANSLATIONS.playStage.buttons.editor)}
        </button>

        <button onClick={onDownload}>
          {useTranslation(TRANSLATIONS.playStage.buttons.map.download)}
        </button>
      </div>
    </div>
  </div>
}