import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createNgo, updateNgo } from "../store/ngoSlice";

const NgoProfileSetup = () => {
    const dispatch = useDispatch();
    const { ngo, loading, error } = useSelector((state) => state.ngoReducer);
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            country: "India",
        },
    });

    useEffect(() => {
        if (ngo) {
            reset({
                ngoName: ngo.ngoName || "",
                ngoDescription: ngo.ngoDescription || "",
                registrationNumber: ngo.registrationNumber || "",
                capacity: ngo.capacity || "",
                street: ngo.address?.street || "",
                area: ngo.address?.area || "",
                landmark: ngo.address?.landmark || "",
                city: ngo.address?.city || "",
                state: ngo.address?.state || "",
                pincode: ngo.address?.pincode || "",
                country: ngo.address?.country || "India",
            });
        }
    }, [ngo, reset]);

    const onSubmit = async (values) => {
        const payload = {
            ngoName: values.ngoName,
            ngoDescription: values.ngoDescription,
            registrationNumber: values.registrationNumber,
            capacity: Number(values.capacity),
            ngoPicture: values.ngoPicture?.[0],
            address: {
                street: values.street,
                area: values.area,
                landmark: values.landmark,
                city: values.city,
                state: values.state,
                pincode: values.pincode,
                country: values.country,
            },
        };

        if (ngo) {
            await dispatch(updateNgo(payload));
        } else {
            await dispatch(createNgo(payload));
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <h2 className="font-display text-3xl">Create NGO profile</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                    Register your NGO to claim nearby surplus meals.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold">NGO name</label>
                        <input
                            type="text"
                            {...register("ngoName", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Description</label>
                        <textarea
                            rows="3"
                            {...register("ngoDescription", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">Registration number</label>
                            <input
                                type="text"
                                {...register("registrationNumber", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Capacity (meals)</label>
                            <input
                                type="number"
                                min="1"
                                {...register("capacity", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold">NGO picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register("ngoPicture")}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">Street</label>
                            <input
                                type="text"
                                {...register("street", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Area</label>
                            <input
                                type="text"
                                {...register("area", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">Landmark</label>
                            <input
                                type="text"
                                {...register("landmark", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">City</label>
                            <input
                                type="text"
                                {...register("city", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">State</label>
                            <input
                                type="text"
                                {...register("state", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Pincode</label>
                            <input
                                type="text"
                                {...register("pincode", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Country</label>
                        <input
                            type="text"
                            {...register("country", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : ngo ? "Update NGO profile" : "Create NGO profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NgoProfileSetup;
