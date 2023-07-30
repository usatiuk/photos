import "./Overview.scss";

import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~/src/redux/reducers";
import {
    photosDeleteCancel,
    photosDeleteStart,
    photosLoadStart,
} from "../redux/photos/actions";
import { TPhotoReqJSON } from "~/src/shared/types";
import { PhotoCard } from "./PhotoCard";
import {
    Alignment,
    Button,
    Classes,
    H2,
    H3,
    Navbar,
    Overlay,
    Spinner,
} from "@blueprintjs/core";
import { UploadButton } from "./UploadButton";
import { Photo } from "./Photo";
import { showDeletionToast } from "~/src/AppToaster";

export interface IOverviewComponentProps {
    photos: TPhotoReqJSON[];
    triedLoading: boolean;
    allPhotosLoaded: boolean;
    overviewFetching: boolean;
    overviewFetchingError: string | null;
    overviewFetchingSpinner: boolean;
    darkMode: boolean;

    fetchPhotos: () => void;
    startDeletePhotos: (photos: TPhotoReqJSON[]) => void;
    cancelDelete: (photos: TPhotoReqJSON[]) => void;
}

const PhotoCardM = React.memo(PhotoCard);

export const OverviewComponent: React.FunctionComponent<
    IOverviewComponentProps
> = (props) => {
    const [selectedPhoto, setSelectedPhoto] = React.useState<number>(0);
    const [isOverlayOpened, setOverlayOpen] = React.useState<boolean>(false);
    const [selectedPhotos, setSelectedPhotos] = React.useState<Set<number>>(
        new Set(),
    );
    const selectedPhotosRef = React.useRef<Set<number>>(selectedPhotos);
    selectedPhotosRef.current = selectedPhotos;
    const onCardClick = (e: React.MouseEvent<HTMLElement>, id: number) => {
        if (e.ctrlKey || e.metaKey) {
            const newSelectedPhotos = new Set<number>([
                ...selectedPhotosRef.current,
            ]);
            if (newSelectedPhotos.has(id)) {
                newSelectedPhotos.delete(id);
            } else {
                newSelectedPhotos.add(id);
            }
            setSelectedPhotos(newSelectedPhotos);
        } else {
            setSelectedPhoto(id);
            setOverlayOpen(true);
        }
    };

    if (
        props.photos.length === 0 &&
        !props.triedLoading &&
        !props.overviewFetching
    ) {
        props.fetchPhotos();
    }

    const dates = props.photos.reduce(
        (
            acc: Record<
                string,
                Record<string, Record<string, TPhotoReqJSON[]>>
            >,
            photo,
        ) => {
            const date = new Date(photo.shotAt);
            const year = date.toLocaleString("default", { year: "numeric" });
            const month = date.toLocaleString("default", { month: "long" });
            const day = date.toLocaleString("default", { day: "numeric" });

            acc[year] = acc[year] || {};
            acc[year][month] = acc[year][month] || {};
            acc[year][month][day] = acc[year][month][day] || [];
            acc[year][month][day].push(photo);

            return acc;
        },
        {},
    );

    const onClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
        onCardClick(e, Number(e.currentTarget.id));
    }, []);

    const photos = Object.keys(dates).reduce(
        (acc: JSX.Element[], year): JSX.Element[] => {
            const els = Object.keys(dates[year]).reduce(
                (accMonths: JSX.Element[], month): JSX.Element[] => {
                    const photos = Object.values(dates[year][month]).reduce(
                        (accDays: TPhotoReqJSON[], day) => {
                            return [...day, ...accDays];
                        },
                        [],
                    );
                    const photosEls = photos.map((photo) => {
                        return (
                            <PhotoCardM
                                selected={selectedPhotos.has(photo.id)}
                                key={"p" + photo.id}
                                id={String(photo.id)}
                                photo={photo}
                                onClick={onClick}
                            />
                        );
                    });
                    return [
                        ...accMonths,
                        <div className="month" key={`${year}${month}`}>
                            <H3>{month}</H3>
                            <div className="list">
                                {photosEls}
                                <div className="photoStub" />
                            </div>
                        </div>,
                    ];
                },
                [],
            );
            return [
                <div className="year" key={year}>
                    <H2>{year}</H2>
                </div>,
                ...els,
                ...acc,
            ];
        },
        [],
    );

    function onLoaderScroll(e: React.UIEvent<HTMLElement>) {
        if (
            e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
            e.currentTarget.scrollHeight - 100
        ) {
            if (!props.allPhotosLoaded && !props.overviewFetching) {
                props.fetchPhotos();
            }
        }
    }

    return (
        <>
            <Overlay
                autoFocus
                enforceFocus
                usePortal
                isOpen={isOverlayOpened}
                onClose={() => {
                    setOverlayOpen(false);
                }}
                transitionDuration={300}
                lazy
            >
                <div id="photoOverlayContainer">
                    <div id="photo">
                        <Photo
                            id={selectedPhoto}
                            close={() => {
                                setOverlayOpen(false);
                            }}
                        />
                    </div>
                    <div id="photoOverlayDrawer">
                        <Button
                            icon="cross"
                            onClick={() => {
                                setOverlayOpen(false);
                            }}
                        />
                    </div>
                </div>
            </Overlay>
            <Overlay
                lazy
                usePortal
                isOpen={selectedPhotos.size > 0}
                transitionDuration={300}
                hasBackdrop={false}
            >
                <div className={"operationsOverlay"}>
                    <Navbar
                        className={props.darkMode ? Classes.DARK : undefined}
                    >
                        <Navbar.Group align={Alignment.LEFT}>
                            <Button minimal={true} icon="edit">
                                Select
                            </Button>
                            <Navbar.Divider />
                        </Navbar.Group>

                        <Navbar.Group align={Alignment.RIGHT}>
                            <Button
                                className="bp4-minimal"
                                icon="trash"
                                text="Delete"
                                onClick={() => {
                                    const photosObjectsWithIds =
                                        props.photos.filter((p) =>
                                            selectedPhotosRef.current.has(p.id),
                                        );
                                    showDeletionToast(() =>
                                        props.cancelDelete(
                                            photosObjectsWithIds,
                                        ),
                                    );
                                    props.startDeletePhotos(
                                        photosObjectsWithIds,
                                    );
                                    selectedPhotosRef.current.clear();
                                }}
                            />
                        </Navbar.Group>
                    </Navbar>
                </div>
            </Overlay>
            <div id="overviewContainer" onScroll={onLoaderScroll}>
                <div id="overview">
                    <div id="actionbar">
                        <UploadButton />
                    </div>
                    {photos}
                    <div className="photosLoader">
                        {props.overviewFetching && <Spinner />}
                    </div>
                </div>
            </div>
        </>
    );
};

function mapStateToProps(state: IAppState) {
    return {
        photos: state.photos.photos,
        allPhotosLoaded: state.photos.allPhotosLoaded,
        overviewFetching: state.photos.overviewFetching,
        overviewFetchingError: state.photos.overviewFetchingError,
        overviewFetchingSpinner: state.photos.overviewFetchingSpinner,
        triedLoading: state.photos.triedLoading,
        darkMode: state.localSettings.darkMode,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        fetchPhotos: () => dispatch(photosLoadStart()),
        startDeletePhotos: (photos: TPhotoReqJSON[]) =>
            dispatch(photosDeleteStart(photos)),
        cancelDelete: (photos: TPhotoReqJSON[]) =>
            dispatch(photosDeleteCancel(photos)),
    };
}

export const Overview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewComponent);
