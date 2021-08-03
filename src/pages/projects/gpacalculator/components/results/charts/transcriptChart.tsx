import React from "react";
import { Bar } from "react-chartjs-2";
import { TranscriptInfoType, SemesterType } from "../../../types/gpaCalculatorTypes";
import { clamp } from "@app/utils/utilFunc";

type props = {
    transcriptInfo: TranscriptInfoType;
    theme: string;
    setSemesterInfo: React.Dispatch<React.SetStateAction<string>>;
    semesterInfo: string;
};

const TranscriptChart = (props: props): JSX.Element => {
    const transcript = props.transcriptInfo;
    const theme = props.theme;
    const maxGpa = 4.0;
    const minGpa = 2.0;
    const data = {
        labels: transcript.semesters.map((semester: SemesterType) => semester.name),
        datasets: [
            {
                type: "line",
                label: "Cumulative GPA",
                data: transcript.semesters.map((semester: SemesterType) => semester.cumulativeGpa),
                fill: false,
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.3)",
            },
            {
                type: "bar",
                label: "Semester GPA [2.0 - 4.0]",
                data: transcript.semesters.map((semester: SemesterType) => (semester.semGpa ? semester.semGpa : null)),
                borderColor: "rgb(0,0,0)",
                backgroundColor: props.transcriptInfo.semesters.map((semester) => {
                    const greenVal = clamp(0, 255, (semester.semGpa - minGpa) * (255 / (maxGpa - minGpa)));
                    const redVal = clamp(0, 255, 255 - (semester.semGpa - minGpa) * (255 / (maxGpa - minGpa)));
                    return `rgba(${redVal}, ${greenVal}, 0, ${theme === "dark" ? "0.7" : "0.4"})`;
                }),
            },
        ],
    };

    let maxLeft = [];
    function generateLabelsNew(chart) {
        const datasets = chart.data.datasets;
        const {
            labels: { usePointStyle, pointStyle, textAlign, color },
        } = chart.legend.options;

        if (maxLeft.length === 0) {
            maxLeft = Array(datasets.length).fill(0);
        }
        return chart._getSortedDatasetMetas().map((meta) => {
            const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
            const borderWidth = style.borderWidth;

            const box = chart?.legend?.legendHitBoxes[meta.index];
            if (box?.left > maxLeft[meta.index]) {
                maxLeft[meta.index] = box.left;
            }

            const gradient = chart.ctx.createLinearGradient(maxLeft[meta.index], 0, maxLeft[meta.index] + 50, 0);
            gradient.addColorStop(0, "rgba(0, 255, 0, 0.4)");
            gradient.addColorStop(1, "rgba(255, 0, 0, 0.4)");

            return {
                text: datasets[meta.index].label,
                fillStyle: datasets[meta.index].label === "Semester GPA [2.0 - 4.0]" ? gradient : style.backgroundColor,
                fontColor: color,
                hidden: !meta.visible,
                lineCap: style.borderCapStyle,
                lineDash: style.borderDash,
                lineDashOffset: style.borderDashOffset,
                lineJoin: style.borderJoinStyle,
                lineWidth: (borderWidth.width + borderWidth.height) / 4,
                strokeStyle: style.borderColor,
                pointStyle: pointStyle || style.pointStyle,
                rotation: style.rotation,
                textAlign: textAlign || style.textAlign,
                borderRadius: 0,
                datasetIndex: meta.index,
            };
        }, this);
    }

    const handleClick = (_event, array) => {
        const index = array[0]?.index;
        const label = data.labels[index];
        if (props.semesterInfo === label) {
            props.setSemesterInfo("");
        } else {
            props.setSemesterInfo(label);
        }
    };

    const themeColor = theme === "dark" ? "white" : "black";
    const options = {
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
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
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
                    footer: (elem) => {
                        return `Units Taken: ${props.transcriptInfo.semesters[
                            elem[0].dataIndex
                        ].totalUnitsTaken.toFixed(1)}`;
                    },
                },
            },
            legend: {
                position: "top",
                labels: {
                    boxWidth: 50,
                    generateLabels: generateLabelsNew,
                    color: themeColor,
                },
            },
        },
    };

    return <Bar className="hover:cursor-pointer" data={data} options={options} />;
};

export default TranscriptChart;
