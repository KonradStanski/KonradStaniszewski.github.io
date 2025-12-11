import React from "react";
import { Bar } from "react-chartjs-2";
import { TranscriptInfoType } from "@/lib/gpaCalculator/types";
import { clamp } from "@/lib/utils";

type Props = {
  transcriptInfo: TranscriptInfoType;
  theme: string;
  setClassInfo: React.Dispatch<React.SetStateAction<string>>;
  classInfo: string;
};

const ClassChart = (props: Props): JSX.Element => {
  const transcript = props.transcriptInfo;
  props.transcriptInfo.classStatistics.sort((a, b) => a.gpa - b.gpa);
  const theme = props.theme;
  const maxGpa = 4.0;
  const minGpa = 2.0;

  const data = {
    labels: transcript.classStatistics.map((classStat) => classStat.name),
    datasets: [
      {
        type: "bar" as const,
        label: "GPA [2.0 - 4.0]",
        data: transcript.classStatistics.map(
          (classStat) => classStat.unitsTaken
        ),
        borderColor: "rgb(0,0,0)",
        backgroundColor: props.transcriptInfo.classStatistics.map(
          (classStat) => {
            const greenVal = clamp(
              0,
              255,
              (classStat.gpa - minGpa) * (255 / (maxGpa - minGpa))
            );
            const redVal = clamp(
              0,
              255,
              255 - (classStat.gpa - minGpa) * (255 / (maxGpa - minGpa))
            );
            return `rgba(${redVal}, ${greenVal}, 0, ${
              theme === "dark" ? "0.7" : "0.4"
            })`;
          }
        ),
      },
    ],
  };

  const handleClick = (_event: any, array: any) => {
    const index = array[0]?.index;
    const label = data.labels[index];
    if (props.classInfo === label) {
      props.setClassInfo("");
    } else {
      props.setClassInfo(label);
    }
  };

  const themeColor = theme === "dark" ? "white" : "black";
  const options: any = {
    animation: {
      duration: 0,
    },
    onClick: handleClick,
    interaction: {
      intersect: false,
    },
    scales: {
      y: {
        title: {
          color: themeColor,
          display: true,
          text: "Units Taken",
        },
        ticks: {
          color: themeColor,
        },
        grid: {
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
        min: 0,
      },
      x: {
        ticks: {
          color: themeColor,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        color: themeColor,
        font: {
          size: 16,
          weight: "bold",
        },
        text: "Units Taken Per Class Type",
      },
      tooltip: {
        callbacks: {
          footer: (elem: any) => {
            return `GPA: ${props.transcriptInfo.classStatistics[
              elem[0].dataIndex
            ].gpa.toFixed(1)}`;
          },
        },
      },
      legend: {
        position: "top" as const,
        labels: {
          textAlign: "left" as const,
          boxWidth: 50,
          color: themeColor,
        },
      },
    },
  };

  return (
    <div className="my-4">
      <Bar height={200} className="hover:cursor-pointer" data={data} options={options} />
    </div>
  );
};

export default ClassChart;
