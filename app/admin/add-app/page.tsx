import { AddAppForm } from "@/components/add-app-form"

export default function AddAppPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New App</h1>
        <p className="text-muted-foreground mt-2">
          Register a new application to the Nordic AI platform. Follow the guidelines below to ensure your app meets our
          standards.
        </p>
      </div>
      <AddAppForm />
    </div>
  )
}
