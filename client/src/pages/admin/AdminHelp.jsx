import {
  BookOpen,
  CheckCircle2,
  ImagePlus,
  KeyRound,
  MessageCircle,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminHelp() {
  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 rounded-[2rem] bg-vjj-black p-6 text-white shadow-luxury md:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-champagne">
              Admin Guide
            </p>

            <h1 className="mt-3 font-serif text-5xl font-bold">
              Help & Instructions
            </h1>

            <p className="mt-4 max-w-2xl text-stone-300">
              Simple guide for managing products, orders, customers and store
              updates from the admin panel.
            </p>
          </div>

          <div className="grid h-20 w-20 place-items-center rounded-full bg-white/10 text-vjj-champagne">
            <BookOpen size={38} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <HelpSection
            icon={<Package />}
            title="How to Add a New Product"
            steps={[
              "Go to Admin → Products.",
              "Click on Add Product.",
              "Fill product name, SKU, category, price and stock.",
              "Add jewellery details like material, purity, weight, collection and occasion.",
              "Upload product images. Maximum 4 images are allowed.",
              "Set one image as Primary.",
              "Enable Active Product if it should be visible on website.",
              "Click Create.",
            ]}
          />

          <HelpSection
            icon={<ImagePlus />}
            title="Product Image Upload Rules"
            steps={[
              "Use clear product photos with good lighting.",
              "Upload JPG, PNG or WEBP images only.",
              "Maximum 4 images are allowed per product.",
              "First image should usually be the front/main product image.",
              "Click Set Primary on the best product image.",
              "Avoid blurry, dark or cropped images.",
            ]}
          />

          <HelpSection
            icon={<PackageCheck />}
            title="How to Edit Product"
            steps={[
              "Go to Admin → Products.",
              "Search product by name, SKU or category.",
              "Click Edit on the product card.",
              "Update required details like price, stock, description or image.",
              "Click Update.",
              "Use the View button to check the product on live website.",
            ]}
          />

          <HelpSection
            icon={<ShoppingBag />}
            title="How to Manage Orders"
            steps={[
              "Go to Admin → Orders.",
              "New customer orders will appear at the top.",
              "Click View to see customer address and ordered items.",
              "Change order status from placed to confirmed, processing, shipped or delivered.",
              "Change payment status to paid once payment is received.",
              "Click Print to print order slip.",
            ]}
          />

          <HelpSection
            icon={<MessageCircle />}
            title="How to Send WhatsApp Order Updates"
            steps={[
              "Go to Admin → Orders.",
              "Update the order status first.",
              "Click WhatsApp button.",
              "A WhatsApp message will open automatically with order details.",
              "Review the message once.",
              "Send it to the customer.",
            ]}
          />

          <HelpSection
            icon={<Users />}
            title="How to Check Customers"
            steps={[
              "Go to Admin → Users.",
              "Search customer by name, email, phone or role.",
              "Use Copy Email to copy customer email quickly.",
              "Use Email button to send email from your mail app.",
              "Admins and customers are shown with separate role badges.",
            ]}
          />

          <HelpSection
            icon={<KeyRound />}
            title="How to Change Admin Password"
            steps={[
              "Go to Admin → Password.",
              "Enter current password.",
              "Enter new password and confirm it.",
              "Click Change Password.",
              "After password change, use the new password for next login.",
            ]}
          />
        </main>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Quick Actions
            </h2>

            <div className="mt-5 grid gap-3">
              <QuickLink to="/admin/products" label="Manage Products" />
              <QuickLink to="/admin/orders" label="Manage Orders" />
              <QuickLink to="/admin/users" label="View Customers" />
              <QuickLink to="/admin/change-password" label="Change Password" />
              <QuickLink to="/" label="View Website" />
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-black/10 bg-vjj-black p-6 text-white shadow-luxury">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-vjj-champagne text-vjj-black">
              <ShieldCheck />
            </div>

            <h3 className="mt-5 font-serif text-3xl font-bold">
              Important Note
            </h3>

            <p className="mt-3 text-sm leading-6 text-stone-300">
              Do not share admin email, admin password, MongoDB password,
              Cloudinary details, Render login or Netlify login with anyone.
            </p>
          </div>

          <div className="mt-5 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-vjj-black">
              Product Checklist
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-stone-600">
              <ChecklistItem text="Product name added" />
              <ChecklistItem text="SKU added" />
              <ChecklistItem text="Category selected" />
              <ChecklistItem text="Price and stock added" />
              <ChecklistItem text="Images uploaded" />
              <ChecklistItem text="Primary image selected" />
              <ChecklistItem text="Product marked active" />
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HelpSection({ icon, title, steps }) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-3xl font-bold text-vjj-black">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Follow these steps carefully.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-3 rounded-2xl bg-vjj-ivory p-4">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-vjj-black text-xs font-bold text-vjj-champagne">
              {index + 1}
            </div>

            <p className="text-sm leading-6 text-stone-700">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
    >
      {label}
      <CheckCircle2 size={17} />
    </Link>
  );
}

function ChecklistItem({ text }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 size={17} className="shrink-0 text-vjj-bronze" />
      <span>{text}</span>
    </li>
  );
}
