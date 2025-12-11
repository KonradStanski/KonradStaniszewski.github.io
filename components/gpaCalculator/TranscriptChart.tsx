import React from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from "chart.js";
import { TranscriptInfoType, SemesterType } from "@/lib/gpaCalculator/types";
import { clamp } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend
);

type Props = {
  transcriptInfo: TranscriptInfoType;
  theme: string;
  setSemesterInfo: React.Dispatch<React.SetStateAction<string>>;
  semesterInfo: string;
};

const TranscriptChart = (props: Props): JSX.Element => {
  const transcript = props.transcriptInfo;
  const theme = props.theme;
  const maxGpa = 4.0;
  const minGpa = 2.0;

  const data = {
    labels: transcript.semesters.map((semester: SemesterType) => semester.name),
    datasets: [
      {
        type: "line" as const,
        label: "Cumulative GPA",
        data: transcript.semesters.map(
          (semester: SemesterType) => semester.cumulativeGpa
        ),
        fill: false,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
      },
      {
        type: "bar" as const,
        label: "Semester GPA [2.0 - 4.0]",
        data: transcript.semesters.map((semester: SemesterType) =>
          semester.semGpa ? semester.semGpa : null
        ),
        borderColor: "rgb(0,0,0)",
        backgroundColor: props.transcriptInfo.semesters.map((semester) => {
          const greenVal = clamp(
            0,
            255,
            (semester.semGpa - minGpa) * (255 / (maxGpa - minGpa))
          );
          const redVal = clamp(
            0,
            255,
            255 - (semester.semGpa - minGpa) * (255 / (maxGpa - minGpa))
          );
          return `rgba(${redVal}, ${greenVal}, 0, ${
            theme === "dark" ? "0.7" : "0.4"
          })`;
        }),
      },
    ],
  };

  const handleClick = (_event: any, array: any) => {
    const index = array[0]?.index;
    const label = data.labels[index];
    if (props.semesterInfo === label) {
      props.setSemesterInfo("");
    } else {
      props.setSemesterInfo(label);
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
          text: "GPA",
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
        min: Math.max(
          0,
          Math.min(
            ...transcript.semesters
              .map((semester: SemesterType) => semester.semGpa)
              .filter((gpa) => gpa !== 0)
          ) - 0.1
        ),
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
        text: "Cumulative GPA by Semester",
      },
      tooltip: {
        callbacks: {
          footer: (elem: any) => {
            return `Units Taken: ${props.transcriptInfo.semesters[
              elem[0].dataIndex
            ].totalUnitsTaken.toFixed(1)}`;
          },
        },
      },
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 50,
          color: themeColor,
        },
      },
    },
  };

  return (
    <div className="my-4">
      <Chart type="bar" height={240} className="hover:cursor-pointer" data={data as any} options={options} />
    </div>
  );
};

export default TranscriptChart;
