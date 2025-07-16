import { createElement, useEffect, useRef, useState, JSX } from "react";
import {
    Scheduler,
    ViewType,
    DATE_FORMAT,
    SchedulerData as SchedulerDataClass
} from "react-big-schedule";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dayjs from "dayjs";
import "react-big-schedule/dist/css/style.css";
import "./ui/ReactPlanner.css";
import { Big } from "big.js";
import { ObjectItem, ValueStatus } from "mendix";
import { ReactPlannerContainerProps } from "./typings/ReactPlannerProps";

type SchedulerDataInstance = InstanceType<typeof SchedulerDataClass>;

interface CustomEventItem {
    id: string | number;
    start: string;
    end: string;
    resourceId: string;
    title: string;
    bgColor?: string;
    click: () => void;
    item: ObjectItem;
}

interface CustomResource {
    id: string | number;
    name: JSX.Element;
    groupOnly?: boolean;
    parentId?: string | number;
}

const defaultEventColor = "#ccc";

const highlightPrefixes = [
    "TC # 22", "TC # 23", "TC # 24", "TC # 25", "TC # 26", "TC # 27",
    "TC # 28", "TC # 29", "TC # 42", "TC # 44", "TC # 46", "TC # 48",
    "TC # 49", "TC # 60", "TC # 61", "TC # 62", "TC # 63", "TC # 64"
];

function ReactPlanner(props: ReactPlannerContainerProps): JSX.Element {
    if (
        props.viewStart?.status !== ValueStatus.Available ||
        props.viewEnd?.status !== ValueStatus.Available
    ) {
        return <div />;
    }

    const [events, setEvents] = useState<CustomEventItem[]>([]);
    const [resources, setResources] = useState<CustomResource[]>([]);
    const [, setUpdateFlag] = useState(0);
    const plannerRef = useRef<HTMLDivElement>(null);
    const [plannerWidth, setPlannerWidth] = useState<number>(0);
    const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

    const getViews = () => {
        const views = [];
        if (props.showDay) views.push({ viewName: "Day", viewType: ViewType.Day });
        if (props.showWeek) views.push({ viewName: "Week", viewType: ViewType.Week });
        if (props.showMonth) views.push({ viewName: "Month", viewType: ViewType.Month });
        if (props.showYear) views.push({ viewName: "Year", viewType: ViewType.Year });
        return views;
    };

    const getDefaultView = () => {
        switch (props.defaultView) {
            case "Day": return ViewType.Day;
            case "Week": return ViewType.Week;
            case "Month": return ViewType.Month;
            case "Year": return ViewType.Year;
            default: return ViewType.Week;
        }
    };

    const schedulerDataRef = useRef(
        new SchedulerDataClass(dayjs().format(DATE_FORMAT), getDefaultView())
    );
    const schedulerData = schedulerDataRef.current;

    schedulerData.config.views = getViews();
    schedulerData.setSchedulerLocale("en");
    schedulerData.setCalendarPopoverLocale("en");
    schedulerData.config.calendarPopoverEnabled = false;
    schedulerData.config.schedulerWidth = "100%";
    schedulerData.config.displayWeekend = props.showWeekends;
    schedulerData.config.eventItemHeight = 28;
    schedulerData.config.eventItemLineHeight = 34;
    schedulerData.config.eventItemMargin = 6;

    // ✅ Fix: Custom date format DD/MM
    schedulerData.config.nonAgendaDayCellHeaderTemplateResolver = (
        _schedulerData: unknown,
        item: { time: string },
        _formattedDate: string
    ): JSX.Element => {
        return <span>{dayjs(item.time).format("ddd DD/MM")}</span>;
    };

    const updateViewStartEnd = (sd: SchedulerDataInstance) => {
        props.viewStart?.setValue(sd.getViewStartDate().toDate());
        props.viewEnd?.setValue(sd.getViewEndDate().toDate());
    };

    const updateSchedulerWidth = () => {
        const schedulerItem = document.getElementById("RBS-Scheduler-root");
        let rightMargin = 0;
        if (schedulerItem) {
            const style = window.getComputedStyle(schedulerItem);
            rightMargin = parseInt(style.marginRight || "0", 10);
        }
        schedulerData.documentWidth += isNaN(rightMargin) ? 0 : rightMargin;
        setUpdateFlag(f => f + 1);
    };

    const updateWidth = () => {
        if (plannerRef.current) {
            setPlannerWidth(plannerRef.current.offsetWidth);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
            resizeTimeout.current = setTimeout(updateWidth, 200);
        };
        updateWidth();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
        };
    }, []);

    useEffect(() => {
        const el = document.getElementById("RBS-Scheduler-root");
        if (!el || el.offsetWidth === 0) {
            requestAnimationFrame(() => updateWidth());
        } else {
            updateWidth();
        }
    }, []);

    useEffect(() => {
        let animationFrame: number | null = null;
        if (plannerWidth > 0) {
            animationFrame = window.requestAnimationFrame(updateSchedulerWidth);
        } else {
            updateSchedulerWidth();
        }
        return () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
        };
    }, [plannerWidth]);

    useEffect(() => {
        const newEvents: CustomEventItem[] = props.eventData?.items?.map(item => {
            const resourceId = props.eventResourceAttr.get(item).value?.toString()!;
            return {
                id: props.eventIdAttr.get(item).value?.toString()!,
                start: props.eventStartAttr.get(item).value?.toString()!,
                end: props.eventEndAttr.get(item).value?.toString()!,
                resourceId,
                title: props.eventTitleAttr.get(item).value?.toString()!,
                bgColor: props.eventColorAttr?.get(item).value || defaultEventColor,
                click: () => onItemClick(item),
                item
            };
        }).filter(event => !!event.resourceId) ?? [];
        setEvents(newEvents);
    }, [props.eventData]);

    useEffect(() => {
        const newResources: CustomResource[] = props.resourceData?.items?.map(item => {
            const rawName = props.resourceNameAttr.get(item).value?.toString() ?? "";
            const prefix = highlightPrefixes.find(p => rawName.startsWith(p));
            const displayName = prefix
                ? (
                    <span title={rawName} style={{ display: "inline-block", wordBreak: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>{prefix}</span>
                        {rawName.substring(prefix.length)}
                    </span>
                )
                : <span title={rawName}>{rawName}</span>;

            return {
                id: props.resourceIdAttr.get(item).value?.toString()!,
                name: displayName
            };
        }) ?? [];
        setResources(newResources);
    }, [props.resourceData]);

    const prevClick = () => {
        schedulerData.prev();
        updateViewStartEnd(schedulerData);
        props.eventData.reload();
    };

    const nextClick = () => {
        schedulerData.next();
        updateViewStartEnd(schedulerData);
        props.eventData.reload();
    };

    const onSelectDate = (_: unknown, date: string) => {
        schedulerData.setDate(date);
        updateViewStartEnd(schedulerData);
        props.eventData.reload();
    };

    const onViewChange = (_: unknown, view: { viewName: string; viewType: number }) => {
        schedulerData.setViewType(view.viewType);
        updateSchedulerWidth();
        updateViewStartEnd(schedulerData);
        props.eventData.reload();
    };

    const onItemClick = (item: ObjectItem) => {
        props.eventSelection.setSelection(item);
        props.onEventSelection?.execute();
    };

    const onNewEvent = (resourceId: string, start: string, end: string) => {
        props.newEventResourceId.setValue(resourceId);
        props.newEventStart.setValue(new Date(start));
        props.newEventEnd.setValue(new Date(end));
        props.newEventAction?.execute();
    };

    const onMoveEvent = (
        _context: unknown,
        event: CustomEventItem,
        newSlotId: string,
        newStart: string,
        _newEnd: string
    ) => {
        if (!event.start || !event.end) return;
        const oldStart = new Date(event.start);
        const oldEnd = new Date(event.end);
        if (isNaN(oldStart.getTime()) || isNaN(oldEnd.getTime())) return;

        let newStartDate = new Date(newStart);
        if (isNaN(newStartDate.getTime())) newStartDate = oldStart;

        const durationMs = oldEnd.getTime() - oldStart.getTime();
        const newEndDate = new Date(newStartDate.getTime() + durationMs);

        if (
            props.dragStartDate?.status === ValueStatus.Available &&
            props.dragEndDate?.status === ValueStatus.Available &&
            props.dragResourceId?.status === ValueStatus.Available &&
            props.dragEventId?.status === ValueStatus.Available
        ) {
            props.eventSelection?.setSelection?.(event.item);
            props.dragStartDate.setValue(newStartDate);
            props.dragEndDate.setValue(newEndDate);
            props.dragResourceId.setValue(newSlotId);
            props.dragEventId.setValue(new Big(event.id));
            props.onEventMoved?.execute();
        }
    };

    const onResizeEvent = (
        event: CustomEventItem,
        newStart: string,
        newEnd: string
    ) => {
        if (
            props.dragStartDate?.status === ValueStatus.Available &&
            props.dragEndDate?.status === ValueStatus.Available &&
            props.dragEventId?.status === ValueStatus.Available
        ) {
            props.eventSelection?.setSelection?.(event.item);
            props.dragStartDate.setValue(new Date(newStart));
            props.dragEndDate.setValue(new Date(newEnd));
            props.dragEventId.setValue(new Big(event.id));
            props.onEventResized?.execute();
            props.eventData?.reload?.();
        }
    };

    if (
        props.eventData.status !== ValueStatus.Available ||
        props.resourceData.status !== ValueStatus.Available
    ) {
        return <div>Loading scheduler…</div>;
    }

    schedulerData.setEvents(events);
    schedulerData.setResources(resources);

    return (
        <div className="react-planner" ref={plannerRef}>
            <Scheduler
                schedulerData={schedulerData}
                prevClick={prevClick}
                nextClick={nextClick}
                onSelectDate={onSelectDate}
                onViewChange={onViewChange}
                eventItemClick={(_: unknown, event: CustomEventItem) => event.click()}
                newEvent={(_: unknown, slotId: string, __: unknown, start: string, end: string) =>
                    onNewEvent(slotId, start, end)
                }
                moveEvent={onMoveEvent}
                updateEventStart={(_: SchedulerDataInstance, event: CustomEventItem, newStart: string) =>
                    onResizeEvent(event, newStart, event.end)
                }
                updateEventEnd={(_: SchedulerDataInstance, event: CustomEventItem, newEnd: string) =>
                    onResizeEvent(event, event.start, newEnd)
                }
                toggleExpandFunc={(_: unknown, slotId: string) => {
                    schedulerData.toggleExpandStatus(slotId);
                    setUpdateFlag(f => f + 1);
                }}
            />
        </div>
    );
}

export default function ReactPlannerWrapper(props: ReactPlannerContainerProps): JSX.Element {
    return (
        <DndProvider backend={HTML5Backend}>
            <ReactPlanner {...props} />
        </DndProvider>
    );
}
