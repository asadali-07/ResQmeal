import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createVolunteer, updateVolunteer } from "../store/volunteerSlice";

const VolunteerProfileSetup = () => {
    const dispatch = useDispatch();
    const { volunteer, loading, error } = useSelector((state) => state.volunteerReducer);
    const { register, handleSubmit, reset } = useForm();
    const [geoStatus, setGeoStatus] = useState("");

    useEffect(() => {
        if (volunteer) {
            reset({
                vehicleType: volunteer.vehicleType || "bike",
                lat: volunteer.currentLocation?.coordinates?.[1] || "",
                lng: volunteer.currentLocation?.coordinates?.[0] || "",
                isAvailable: volunteer.isAvailable ?? true,
            });
        }
    }, [volunteer, reset]);

    const fillLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus("Geolocation not available");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                reset((current) => ({
                    ...current,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }));
                setGeoStatus("Location captured");
            },
            () => setGeoStatus("Unable to fetch location"),
            { enableHighAccuracy: true }
        );
    };

    const onSubmit = async (values) => {
        const payload = {
            currentLocation: {
                type: "Point",
                coordinates: [Number(values.lng), Number(values.lat)],
            },
            vehicleType: values.vehicleType,
            isAvailable: values.isAvailable,
        };

        if (volunteer) {
            await dispatch(updateVolunteer(payload));
        } else {
            await dispatch(createVolunteer(payload));
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <h2 className="font-display text-3xl">Create volunteer profile</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                    Set your vehicle and live location to accept nearby pickups.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold">Vehicle type</label>
                        <select
                            {...register("vehicleType", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        >
                            <option value="bike">Bike</option>
                            <option value="car">Car</option>
                            <option value="van">Van</option>
                        </select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">Latitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                {...register("lat", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Longitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                {...register("lng", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={fillLocation}
                            className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--accent-2)]"
                        >
                            Use my location
                        </button>
                        {geoStatus && <span className="text-xs text-[var(--muted)]">{geoStatus}</span>}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...register("isAvailable")} />
                        Available for pickups
                    </label>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : volunteer
                              ? "Update volunteer profile"
                              : "Create volunteer profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VolunteerProfileSetup;
