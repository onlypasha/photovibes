"use client";

import Header from "./components/Header";
import CameraStage from "./components/CameraStage";

export default function PhotoboothPage() {
  return (
    <div className="bg-background-light text-gray-800 font-display min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col h-screen relative">
        <Header />
        <CameraStage />
      </main>
    </div>
  );
}
