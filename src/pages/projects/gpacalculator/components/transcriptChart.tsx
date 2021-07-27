import React from "react";
import { Bar } from "react-chartjs-2";
import { transcriptInfoType, semesterType } from "../gpaCalculatorTypes";

type props = {
    transcriptInfo: transcriptInfoType;
    theme: string;
};

const TranscriptChart = (props: props): JSX.Element => {
    const transcript = props.transcriptInfo;
    const theme = props.theme;

    const data = {
        labels: transcript.semesters.map((semester: semesterType) => semester.name),
        datasets: [
            {
                type: "line",
                label: "Cumulative GPA",
                data: transcript.semesters.map((semester: semesterType) => semester.cumulativeGpa),
                fill: false,
                borderColor: "rgb(54, 162, 235)",
            },
            {
                type: "bar",
                label: "Semester GPA",
                data: transcript.semesters.map((semester: semesterType) => (semester.semGpa ? semester.semGpa : null)),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: `rgba(255, 99, 132, ${theme === "dark" ? "0.7" : "0.2"})`,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                ticks: {
                    color: theme === "dark" ? "white" : "black",
                },
                grid: {
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                },
                min: Math.max(
                    0,
                    Math.min(
                        ...transcript.semesters
                            .map((semester: semesterType) => semester.semGpa)
                            .filter((gpa) => gpa !== 0)
                    ) - 0.1
                ),
            },
            x: {
                ticks: {
                    color: theme === "dark" ? "white" : "black",
                },
                grid: {
                    display: false,
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: theme === "dark" ? "white" : "black",
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default TranscriptChart;
